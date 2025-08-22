from django.http import JsonResponse
from .models import Organization
import json

class OrganizationAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for signup and login mutations
        if request.method == 'POST' and request.path == '/graphql/':
            data = json.loads(request.body)
            query = data.get('query', '')
            
            # Allow these mutations without API key
            if 'signUpOrganization' in query or 'loginOrganization' in query:
                return self.get_response(request)

            # Check API key for all other operations
            api_key = request.headers.get('X-API-Key')
            if not api_key:
                return JsonResponse({
                    'errors': [{'message': 'API key is required'}]
                }, status=401)

            try:
                organization = Organization.objects.get(api_key=api_key)
                # Add organization to request for use in resolvers
                request.organization = organization
            except Organization.DoesNotExist:
                return JsonResponse({
                    'errors': [{'message': 'Invalid API key'}]
                }, status=401)

        return self.get_response(request)