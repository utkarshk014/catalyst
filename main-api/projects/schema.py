import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment
from datetime import date

# Object Types: Define GraphQL types for your Django models
class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "contact_email")

class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()

    class Meta:
        model = Project
        fields = ("id", "name", "description", "status", "due_date", "organization", "task_set")

    def resolve_task_count(self, info):
        return self.task_set.count()

    def resolve_completed_tasks(self, info):
        return self.task_set.filter(status='DONE').count()

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "status", "assignee_email", "due_date", "project", "taskcomment_set")

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ("id", "content", "author_email", "timestamp", "task")

# Queries: Define what data can be fetched
class Query(graphene.ObjectType):
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))
    all_projects = graphene.List(ProjectType, organization_slug=graphene.String(required=True))
    all_tasks = graphene.List(TaskType, project_id=graphene.Int(required=True))

    def resolve_all_projects(self, info, organization_slug):
        # Implement multi-tenancy by filtering projects based on the organization slug
        try:
            organization = Organization.objects.get(slug=organization_slug)
            return Project.objects.filter(organization=organization)
        except Organization.DoesNotExist:
            return Project.objects.none() # Return an empty queryset if organization not found

    def resolve_all_tasks(self, info, project_id):
        return Task.objects.filter(project_id=project_id)
    
    def resolve_organization(self, info, slug):
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return None

# Mutations: Define how to create, update, and delete data
class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        organization_slug = graphene.String(required=True)
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, name, organization_slug, description=None, status=None, due_date=None):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            project = Project.objects.create(
                name=name,
                description=description,
                status=status or 'ACTIVE',
                due_date=due_date,
                organization=organization
            )
            return CreateProject(project=project)
        except Organization.DoesNotExist:
            return CreateProject(project=None)
        
class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.Int(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, project_id, title, description=None, status="TODO", assignee_email=None, due_date=None):
        try:
            project = Project.objects.get(id=project_id)
            task = Task.objects.create(
                project=project,
                title=title,
                description=description,
                status=status,
                assignee_email=assignee_email,
                due_date=due_date
            )
            return CreateTask(task=task)
        except Project.DoesNotExist:
            raise Exception(f"Project with ID {project_id} does not exist")

class UpdateTaskStatus(graphene.Mutation):
    class Arguments:
        task_id = graphene.Int(required=True)
        status = graphene.String(required=True)

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, task_id, status):
        task = Task.objects.get(pk=task_id)
        task.status = status
        task.save()
        return UpdateTaskStatus(task=task)

class CreateTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.Int(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    @staticmethod
    def mutate(root, info, task_id, content, author_email):
        task = Task.objects.get(pk=task_id)
        comment = TaskComment.objects.create(
            task=task,
            content=content,
            author_email=author_email
        )
        return CreateTaskComment(comment=comment)

# class Mutation(graphene.ObjectType):
#     create_project = CreateProject.Field()
#     update_task_status = UpdateTaskStatus.Field()
#     create_task_comment = CreateTaskComment.Field()
#     create_task = CreateTask.Field()

class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        contact_email = graphene.String(required=True)
        slug = graphene.String()

    organization = graphene.Field(OrganizationType)

    @staticmethod
    def mutate(root, info, name, contact_email, slug=None):
        organization = Organization.objects.create(
            name=name,
            contact_email=contact_email,
            slug=slug
        )
        return CreateOrganization(organization=organization)
    

class AuthResponse(graphene.ObjectType):
    success = graphene.Boolean()
    message = graphene.String()
    api_key = graphene.String()

class SignUpOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        contact_email = graphene.String(required=True)
        password = graphene.String(required=True)

    Output = AuthResponse

    @staticmethod
    def mutate(root, info, name, contact_email, password):
        # Check if organization with email already exists
        if Organization.objects.filter(contact_email=contact_email).exists():
            return AuthResponse(
                success=False,
                message="Organization with this email already exists",
                api_key=None
            )

        try:
            org = Organization.objects.create(
                name=name,
                contact_email=contact_email,
                password=password  # Will be hashed in save() method
            )
            
            return AuthResponse(
                success=True,
                message="Organization created successfully",
                api_key=org.api_key
            )
        except Exception as e:
            return AuthResponse(
                success=False,
                message=str(e),
                api_key=None
            )

class LoginOrganization(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    Output = AuthResponse

    @staticmethod
    def mutate(root, info, email, password):
        try:
            org = Organization.objects.get(contact_email=email)
            
            if org.check_password(password):
                return AuthResponse(
                    success=True,
                    message="Login successful",
                    api_key=org.api_key
                )
            else:
                return AuthResponse(
                    success=False,
                    message="Invalid password",
                    api_key=None
                )
                
        except Organization.DoesNotExist:
            return AuthResponse(
                success=False,
                message="Organization not found",
                api_key=None
            )


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    create_task = CreateTask.Field()  # This was missing in the second definition
    update_task_status = UpdateTaskStatus.Field()
    create_task_comment = CreateTaskComment.Field()
    sign_up_organization = SignUpOrganization.Field()
    login_organization = LoginOrganization.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)