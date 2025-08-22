from django.http import JsonResponse
from .models import Organization
import json
import logging

logger = logging.getLogger(__name__)

class OrganizationAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for signup and login mutations
        if request.method == 'POST' and request.path == '/graphql/':
            try:
                data = json.loads(request.body)
                query = data.get('query', '')
                
                logger.info(f"GraphQL query: {query[:100]}...")  # Log first 100 chars
                
                # Allow these mutations without API key
                if 'signUpOrganization' in query or 'loginOrganization' in query:
                    logger.info("Allowing auth mutation without API key")
                    return self.get_response(request)

                # Check API key for all other operations
                api_key = request.headers.get('X-API-Key')
                logger.info(f"API Key present: {bool(api_key)}")
                
                if not api_key:
                    logger.warning("No API key provided")
                    return JsonResponse({
                        'errors': [{'message': 'API key is required'}]
                    }, status=401)

                try:
                    organization = Organization.objects.get(api_key=api_key)
                    logger.info(f"Organization found: {organization.name}")
                    # Add organization to request for use in resolvers
                    request.organization = organization
                except Organization.DoesNotExist:
                    logger.warning(f"Invalid API key: {api_key}")
                    return JsonResponse({
                        'errors': [{'message': 'Invalid API key'}]
                    }, status=401)
                    
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                return JsonResponse({
                    'errors': [{'message': 'Invalid JSON in request body'}]
                }, status=400)
            except Exception as e:
                logger.error(f"Middleware error: {e}")
                return JsonResponse({
                    'errors': [{'message': f'Middleware error: {str(e)}'}]
                }, status=500)

        return self.get_response(request)