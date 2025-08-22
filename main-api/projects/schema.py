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

class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    update_task_status = UpdateTaskStatus.Field()
    create_task_comment = CreateTaskComment.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)