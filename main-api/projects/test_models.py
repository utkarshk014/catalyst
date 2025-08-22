from django.test import TestCase
from django.utils.text import slugify
from .models import Organization, Project, Task, TaskComment
from datetime import date, timedelta


class OrganizationModelTest(TestCase):
    def setUp(self):
        self.org_data = {
            'name': 'Test Organization',
            'contact_email': 'test@example.com',
            'password': 'testpassword123'
        }

    def test_organization_creation(self):
        """Test that organization can be created with required fields"""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.name, 'Test Organization')
        self.assertEqual(org.contact_email, 'test@example.com')
        self.assertTrue(org.slug)
        self.assertTrue(org.api_key)

    def test_organization_slug_generation(self):
        """Test that unique slug is generated automatically"""
        org1 = Organization.objects.create(**self.org_data)
        org2 = Organization.objects.create(
            name='Test Organization',
            contact_email='test2@example.com',
            password='testpassword123'
        )
        
        self.assertNotEqual(org1.slug, org2.slug)
        self.assertTrue(org1.slug.startswith('test-organization-'))
        self.assertTrue(org2.slug.startswith('test-organization-'))

    def test_organization_api_key_generation(self):
        """Test that unique API key is generated automatically"""
        org = Organization.objects.create(**self.org_data)
        self.assertTrue(org.api_key)
        self.assertEqual(len(org.api_key), 36)  # UUID length

    def test_organization_password_hashing(self):
        """Test that password is properly hashed"""
        org = Organization.objects.create(**self.org_data)
        self.assertTrue(org.password.startswith('$2b$'))
        self.assertTrue(org.check_password('testpassword123'))
        self.assertFalse(org.check_password('wrongpassword'))


class ProjectModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            contact_email='test@example.com',
            password='testpassword123'
        )
        self.project_data = {
            'name': 'Test Project',
            'description': 'A test project description',
            'status': 'ACTIVE',
            'due_date': date.today() + timedelta(days=30)
        }

    def test_project_creation(self):
        """Test that project can be created with required fields"""
        project = Project.objects.create(
            organization=self.org,
            **self.project_data
        )
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.organization, self.org)
        self.assertEqual(project.status, 'ACTIVE')

    def test_project_organization_relationship(self):
        """Test that project is properly linked to organization"""
        project = Project.objects.create(
            organization=self.org,
            **self.project_data
        )
        self.assertEqual(project.organization.name, 'Test Organization')
        self.assertIn(project, self.org.project_set.all())


class TaskModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            contact_email='test@example.com',
            password='testpassword123'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='A test project',
            status='ACTIVE'
        )
        self.task_data = {
            'title': 'Test Task',
            'description': 'A test task description',
            'status': 'TODO',
            'assignee_email': 'assignee@example.com',
            'due_date': date.today() + timedelta(days=7)
        }

    def test_task_creation(self):
        """Test that task can be created with required fields"""
        task = Task.objects.create(
            project=self.project,
            **self.task_data
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.project, self.project)
        self.assertEqual(task.status, 'TODO')

    def test_task_project_relationship(self):
        """Test that task is properly linked to project"""
        task = Task.objects.create(
            project=self.project,
            **self.task_data
        )
        self.assertEqual(task.project.name, 'Test Project')
        self.assertIn(task, self.project.task_set.all())

    def test_task_status_choices(self):
        """Test that task status uses valid choices"""
        valid_statuses = ['TODO', 'IN_PROGRESS', 'DONE']
        for status in valid_statuses:
            task = Task.objects.create(
                project=self.project,
                title=f'Task {status}',
                status=status
            )
            self.assertEqual(task.status, status)


class TaskCommentModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            contact_email='test@example.com',
            password='testpassword123'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='A test project',
            status='ACTIVE'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task',
            description='A test task',
            status='TODO'
        )

    def test_comment_creation(self):
        """Test that comment can be created with required fields"""
        comment = TaskComment.objects.create(
            task=self.task,
            content='A test comment',
            author_email='commenter@example.com'
        )
        self.assertEqual(comment.content, 'A test comment')
        self.assertEqual(comment.task, self.task)
        self.assertEqual(comment.author_email, 'commenter@example.com')

    def test_comment_task_relationship(self):
        """Test that comment is properly linked to task"""
        comment = TaskComment.objects.create(
            task=self.task,
            content='A test comment',
            author_email='commenter@example.com'
        )
        self.assertEqual(comment.task.title, 'Test Task')
        self.assertIn(comment, self.task.taskcomment_set.all())

    def test_comment_timestamp_auto_generation(self):
        """Test that comment timestamp is automatically generated"""
        comment = TaskComment.objects.create(
            task=self.task,
            content='A test comment',
            author_email='commenter@example.com'
        )
        self.assertIsNotNone(comment.timestamp)
        self.assertIsInstance(comment.timestamp, type(comment.timestamp))
