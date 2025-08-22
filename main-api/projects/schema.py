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
    taskCount = graphene.Int()
    completedTasks = graphene.Int()

    class Meta:
        model = Project
        fields = ("id", "name", "description", "status", "due_date", "organization", "task_set")

    def resolve_taskCount(self, info):
        return self.task_set.count()

    def resolve_completedTasks(self, info):
        return self.task_set.filter(status='DONE').count()

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "status", "assignee_email", "due_date", "project", "taskcomment_set")

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ("id", "content", "author_email", "timestamp", "task")

class Query(graphene.ObjectType):
    organization = graphene.Field(OrganizationType)
    all_projects = graphene.List(ProjectType)
    all_tasks = graphene.List(TaskType, project_id=graphene.String(required=True))

    def resolve_organization(self, info):
        return info.context.organization

    def resolve_all_projects(self, info):
        request_org = info.context.organization
        return Project.objects.filter(organization=request_org)

    def resolve_all_tasks(self, info, project_id):
        request_org = info.context.organization
        try:
            # Convert string project_id to int
            project_id_int = int(project_id)
            project = Project.objects.get(id=project_id_int)
            if project.organization != request_org:
                raise Exception("Not authorized to access this project's tasks")
            return Task.objects.filter(project_id=project_id_int)
        except (ValueError, Project.DoesNotExist):
            raise Exception(f"Project with ID {project_id} does not exist")   

class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        dueDate = graphene.String()

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, name, description=None, status=None, dueDate=None):
        request_org = info.context.organization
        
        # Parse dueDate if provided
        parsed_due_date = None
        if dueDate:
            try:
                from datetime import datetime
                # Extract just the date part from ISO string or parse date string
                if 'T' in dueDate:
                    parsed_due_date = datetime.fromisoformat(dueDate.split('T')[0]).date()
                else:
                    parsed_due_date = datetime.strptime(dueDate, '%Y-%m-%d').date()
            except ValueError:
                raise Exception("Invalid date format")
        
        project = Project.objects.create(
            name=name,
            description=description,
            status=status or 'ACTIVE',
            due_date=parsed_due_date,
            organization=request_org
        )
        return CreateProject(project=project)

class CreateTask(graphene.Mutation):
    class Arguments:
        projectId = graphene.String(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assigneeEmail = graphene.String()
        dueDate = graphene.String()

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, projectId, title, description=None, status="TODO", assigneeEmail=None, dueDate=None):
        request_org = info.context.organization
        try:
            # Convert string projectId to int
            project_id_int = int(projectId)
            project = Project.objects.get(id=project_id_int)
            if project.organization != request_org:
                raise Exception("Not authorized to create tasks for this project")
            
            # Parse dueDate if provided
            due_date_obj = None
            if dueDate:
                try:
                    from datetime import datetime
                    # Extract just the date part from ISO string or parse date string
                    if 'T' in dueDate:
                        due_date_obj = datetime.fromisoformat(dueDate.split('T')[0]).date()
                    else:
                        due_date_obj = datetime.strptime(dueDate, '%Y-%m-%d').date()
                except ValueError:
                    raise Exception("Invalid date format")
            
            task = Task.objects.create(
                project=project,
                title=title,
                description=description,
                status=status,
                assignee_email=assigneeEmail,
                due_date=due_date_obj
            )
            return CreateTask(task=task)
        except ValueError:
            raise Exception(f"Invalid project ID: {projectId}")
        except Project.DoesNotExist:
            raise Exception(f"Project with ID {projectId} does not exist")

class UpdateTaskStatus(graphene.Mutation):
    class Arguments:
        taskId = graphene.String(required=True)
        status = graphene.String(required=True)

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, taskId, status):
        request_org = info.context.organization
        try:
            # Convert string taskId to int
            task_id_int = int(taskId)
            task = Task.objects.get(pk=task_id_int)
            if task.project.organization != request_org:
                raise Exception("Not authorized to update this task")
            
            task.status = status
            task.save()
            return UpdateTaskStatus(task=task)
        except ValueError:
            raise Exception(f"Invalid task ID: {taskId}")
        except Task.DoesNotExist:
            raise Exception(f"Task with ID {taskId} does not exist")

class DeleteTask(graphene.Mutation):
    class Arguments:
        taskId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @staticmethod
    def mutate(root, info, taskId):
        request_org = info.context.organization
        try:
            # Convert string taskId to int
            task_id_int = int(taskId)
            task = Task.objects.get(pk=task_id_int)
            if task.project.organization != request_org:
                raise Exception("Not authorized to delete this task")
            
            task.delete()
            return DeleteTask(success=True, message="Task deleted successfully")
        except ValueError:
            raise Exception(f"Invalid task ID: {taskId}")
        except Task.DoesNotExist:
            raise Exception(f"Task {taskId} does not exist")

class DeleteProject(graphene.Mutation):
    class Arguments:
        projectId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @staticmethod
    def mutate(root, info, projectId):
        request_org = info.context.organization
        try:
            # Convert string projectId to int
            project_id_int = int(projectId)
            project = Project.objects.get(id=project_id_int)
            if project.organization != request_org:
                raise Exception("Not authorized to delete this project")
            
            project.delete()
            return DeleteProject(success=True, message="Project deleted successfully")
        except ValueError:
            raise Exception(f"Invalid project ID: {projectId}")
        except Project.DoesNotExist:
            raise Exception(f"Project {projectId} does not exist")

class UpdateTask(graphene.Mutation):
    class Arguments:
        taskId = graphene.String(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assigneeEmail = graphene.String()
        dueDate = graphene.String()

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, taskId, title=None, description=None, status=None, assigneeEmail=None, dueDate=None):
        request_org = info.context.organization
        try:
            # Convert string taskId to int
            task_id_int = int(taskId)
            task = Task.objects.get(pk=task_id_int)
            if task.project.organization != request_org:
                raise Exception("Not authorized to update this task")
            
            # Update fields if provided
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if status is not None:
                task.status = status
            if assigneeEmail is not None:
                task.assignee_email = assigneeEmail
            if dueDate is not None:
                # Parse dueDate if provided
                try:
                    from datetime import datetime
                    # Extract just the date part from ISO string or parse date string
                    if 'T' in dueDate:
                        due_date_obj = datetime.fromisoformat(dueDate.split('T')[0]).date()
                    else:
                        due_date_obj = datetime.strptime(dueDate, '%Y-%m-%d').date()
                    task.due_date = due_date_obj
                except ValueError:
                    raise Exception("Invalid date format")
            
            task.save()
            return UpdateTask(task=task)
        except ValueError:
            raise Exception(f"Invalid task ID: {taskId}")
        except Task.DoesNotExist:
            raise Exception(f"Task {taskId} does not exist")

class CreateTaskComment(graphene.Mutation):
    class Arguments:
        taskId = graphene.String(required=True)
        content = graphene.String(required=True)
        authorEmail = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    @staticmethod
    def mutate(root, info, taskId, content, authorEmail):
        request_org = info.context.organization
        try:
            # Convert string taskId to int
            task_id_int = int(taskId)
            task = Task.objects.get(pk=task_id_int)
            if task.project.organization != request_org:
                raise Exception("Not authorized to comment on this task")
            
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=authorEmail
            )
            return CreateTaskComment(comment=comment)
        except ValueError:
            raise Exception(f"Invalid task ID: {taskId}")
        except Task.DoesNotExist:
            raise Exception(f"Task {taskId} does not exist")

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
    organization = graphene.Field(OrganizationType)

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
                api_key=org.api_key,
                organization=org
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
                api_key=org.api_key,
                organization=org
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
    update_task = UpdateTask.Field()
    update_task_status = UpdateTaskStatus.Field()
    delete_task = DeleteTask.Field()
    delete_project = DeleteProject.Field()
    create_task_comment = CreateTaskComment.Field()
    sign_up_organization = SignUpOrganization.Field()
    login_organization = LoginOrganization.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)