from django.test import TestCase
from django.contrib.auth.models import AnonymousUser
from graphene.test import Client
from django.test import RequestFactory
from .models import Organization, Project, Task, TaskComment
from .schema import schema
from datetime import date, timedelta
import json


class GraphQLSchemaTest(TestCase):
    def setUp(self):
        self.client = Client(schema)
        self.factory = RequestFactory()
        
        # Create test organization
        self.org = Organization.objects.create(
            name='Test Organization',
            contact_email='test@example.com',
            password='testpassword123'
        )
        
        # Create test project
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='A test project',
            status='ACTIVE',
            due_date=date.today() + timedelta(days=30)
        )
        
        # Create test task
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task',
            description='A test task',
            status='TODO',
            assignee_email='assignee@example.com',
            due_date=date.today() + timedelta(days=7)
        )

    def test_organization_query(self):
        """Test that organization query works"""
        query = '''
        query {
            organization {
                id
                name
                slug
                contactEmail
            }
        }
        '''
        
        # Create request with organization context
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(query, context_value=request)
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('organization', data)
        self.assertEqual(data['organization']['name'], 'Test Organization')

    def test_projects_query(self):
        """Test that projects query works"""
        query = '''
        query {
            allProjects {
                id
                name
                description
                status
                taskCount
                completedTasks
            }
        }
        '''
        
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(query, context_value=request)
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('allProjects', data)
        self.assertEqual(len(data['allProjects']), 1)
        self.assertEqual(data['allProjects'][0]['name'], 'Test Project')

    def test_tasks_query(self):
        """Test that tasks query works"""
        query = '''
        query GetTasks($projectId: String!) {
            allTasks(projectId: $projectId) {
                id
                title
                description
                status
                assigneeEmail
                dueDate
            }
        }
        '''
        
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(
            query, 
            context_value=request,
            variable_values={'projectId': str(self.project.id)}
        )
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('allTasks', data)
        self.assertEqual(len(data['allTasks']), 1)
        self.assertEqual(data['allTasks'][0]['title'], 'Test Task')

    def test_create_project_mutation(self):
        """Test that create project mutation works"""
        mutation = '''
        mutation CreateProject($name: String!, $description: String) {
            createProject(name: $name, description: $description) {
                project {
                    id
                    name
                    description
                    status
                }
            }
        }
        '''
        
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(
            mutation,
            context_value=request,
            variable_values={
                'name': 'New Project',
                'description': 'A new test project'
            }
        )
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('createProject', data)
        self.assertEqual(data['createProject']['project']['name'], 'New Project')

    def test_create_task_mutation(self):
        """Test that create task mutation works"""
        mutation = '''
        mutation CreateTask($projectId: String!, $title: String!, $description: String) {
            createTask(projectId: $projectId, title: $title, description: $description) {
                task {
                    id
                    title
                    description
                    status
                }
            }
        }
        '''
        
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(
            mutation,
            context_value=request,
            variable_values={
                'projectId': str(self.project.id),
                'title': 'New Task',
                'description': 'A new test task'
            }
        )
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('createTask', data)
        self.assertEqual(data['createTask']['task']['title'], 'New Task')

    def test_update_task_status_mutation(self):
        """Test that update task status mutation works"""
        mutation = '''
        mutation UpdateTaskStatus($taskId: String!, $status: String!) {
            updateTaskStatus(taskId: $taskId, status: $status) {
                task {
                    id
                    title
                    status
                }
            }
        }
        '''
        
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(
            mutation,
            context_value=request,
            variable_values={
                'taskId': str(self.task.id),
                'status': 'IN_PROGRESS'
            }
        )
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('updateTaskStatus', data)
        self.assertEqual(data['updateTaskStatus']['task']['status'], 'IN_PROGRESS')

    def test_create_task_comment_mutation(self):
        """Test that create task comment mutation works"""
        mutation = '''
        mutation CreateTaskComment($taskId: String!, $content: String!, $authorEmail: String!) {
            createTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
                comment {
                    id
                    content
                    authorEmail
                }
            }
        }
        '''
        
        request = self.factory.post('/graphql/')
        request.organization = self.org
        
        result = self.client.execute(
            mutation,
            context_value=request,
            variable_values={
                'taskId': str(self.task.id),
                'content': 'A test comment',
                'authorEmail': 'commenter@example.com'
            }
        )
        
        self.assertIsNone(result.get('errors'))
        data = result.get('data', {})
        self.assertIn('createTaskComment', data)
        self.assertEqual(data['createTaskComment']['comment']['content'], 'A test comment')
