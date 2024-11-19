from django.urls import path, include
from rest_framework import routers
from courses import views
from courses.views import paypal_webhook_success, paypal_webhook_cancel

router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('courses', views.CourseViewSet, basename='courses')
router.register('lessons', views.LessonViewSet, basename='lessons')
router.register('users', views.UserViewSet, basename='users')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('tags', views.TagViewSet, basename='tags')
router.register('assignments', views.AssignmentViewSet, basename='assignments')
router.register('books', views.BookViewSet, basename='books')
router.register('payments', views.PaymentViewSet, basename='payments')
urlpatterns = [
    path('', include(router.urls)),
    # path('payments/webhook/success/', views.PaymentViewSet.as_view({'post': 'paypal_webhook_success'})),
    # path('payments/webhook/success/', views.PaymentViewSet.as_view({'get': 'paypal_webhook_success'})),
    # path('payments/webhook/cancel/', views.PaymentViewSet.as_view({'post': 'paypal_webhook_cancel'})),
    path('payments/webhook/success/', paypal_webhook_success, name='paypal_webhook_success'),
    path('payments/webhook/cancel/', paypal_webhook_cancel, name='paypal_webhook_cancel'),
]
