from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from datetime import date
import uuid
import bcrypt

STATUS_CHOICES = (
    ('ACTIVE', 'Active'),
    ('COMPLETED', 'Completed'),
    ('ON_HOLD', 'On Hold'),
)

TASK_STATUS_CHOICES = (
    ('TODO', 'To Do'),
    ('IN_PROGRESS', 'In Progress'),
    ('DONE', 'Done'),
)

class Organization(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    contact_email = models.EmailField()
    password = models.CharField(max_length=255, default='')  # Storing hashed password
    api_key = models.CharField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # Create unique slug: name + random string
            base_slug = slugify(self.name)
            unique_id = str(uuid.uuid4())[:8]
            self.slug = f"{base_slug}-{unique_id}"
            
        if not self.api_key:
            # Generate unique API key
            self.api_key = str(uuid.uuid4())

        # Hash password if it's not already hashed
        if not self.password.startswith('$2b$'):
            self.password = bcrypt.hashpw(
                self.password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
            
        super().save(*args, **kwargs)

    def check_password(self, raw_password):
        return bcrypt.checkpw(
            raw_password.encode('utf-8'), 
            self.password.encode('utf-8')
        )

    def __str__(self):
        return self.name

class Project(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES, default='TODO')
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    content = models.TextField()
    author_email = models.EmailField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author_email} on {self.task.title}"