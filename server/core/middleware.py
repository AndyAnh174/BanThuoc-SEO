import logging
import json
import time

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """
    Middleware to log request body and response for debugging/auditing.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Log Request
        self.process_request(request)

        response = self.get_response(request)

        # Log Response
        self.process_response(request, response, start_time)

        return response

    def process_request(self, request):
        try:
            # Don't log static files or heartbeats
            if request.path.startswith('/static/') or request.path.startswith('/media/'):
                return

            body = None
            if request.body:
                try:
                    body = json.loads(request.body)
                except:
                    body = "(binary or non-json data)"
            
            print(f"\n🚀 [{request.method}] {request.path}")
            if request.GET:
                print(f"   Query: {request.GET.dict()}")
            if body and body != "(binary or non-json data)":
                print(f"   Body: {json.dumps(body, indent=2)}")
            elif body:
                print(f"   Body: {body}")
                
        except Exception as e:
            print(f"⚠️ Error logging request: {e}")

    def process_response(self, request, response, start_time):
        try:
            # Don't log static files
            if request.path.startswith('/static/') or request.path.startswith('/media/'):
                return

            duration = (time.time() - start_time) * 1000
            
            status_emoji = "✅"
            if response.status_code >= 500:
                status_emoji = "🔥"
            elif response.status_code >= 400:
                status_emoji = "⚠️"
                
            print(f"{status_emoji} [{response.status_code}] {request.path} ({duration:.2f}ms)")
            
            # Log error details if 400/500
            if response.status_code >= 400 and hasattr(response, 'data'):
                print(f"   Error Details: {response.data}")
                
        except Exception as e:
            print(f"⚠️ Error logging response: {e}")
