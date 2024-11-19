import paypalrestsdk
from django.shortcuts import render
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from courses import serializers, paginators
from courses.models import Category, Course, Lesson, User, Comment, Like, Tag, Assignment, Book, Payment
from courses import perms


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class TagViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer


class CourseViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Course.objects.filter(active=True).all()
    serializer_class = serializers.CourseSerializer
    pagination_class = paginators.CoursePaginator
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queries = self.queryset

        kw = self.request.query_params.get("kw")
        if kw:
            queries = queries.filter(subject__icontains=kw)

        return queries

    @action(methods=['get'], detail=True)
    def lessons(self, request, pk):
        lessons = self.get_object().lesson_set.filter(active=True).all()

        return Response(serializers.LessonSerializer(lessons, many=True, context={'request': request}).data,
                        status=status.HTTP_200_OK)


class LessonViewSet(viewsets.ModelViewSet):  # Thay đổi từ ViewSet sang ModelViewSet
    queryset = Lesson.objects.filter(active=True).all()
    serializer_class = serializers.LessonDetailsSerializer
    permission_classes = [permissions.AllowAny]

    @action(methods=['get'], detail=True, url_path='comments')
    def comments(self, request, pk):
        comments = self.get_object().comment_set.filter(active=True).all()
        return Response(serializers.CommentSerializer(comments, many=True, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='comments', detail=True)
    def add_comment(self, request, pk):
        lesson = self.get_object()
        c = Comment.objects.create(user=request.user, lesson=lesson, content=request.data.get('content'))
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        lesson = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, lesson=lesson)
        if not created:
            like.active = not like.active
            like.save()
        return Response(serializers.LessonDetailsSerializer(lesson, context={'request': request}).data,
                        status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerAuthenticated]

    def list(self, request):
        try:
            lesson_id = request.query_params.get('lesson_id')  # Lấy post_id từ query parameters
            if not lesson_id:
                return Response({"message": "Parameter lesson_id is missing."}, status=status.HTTP_400_BAD_REQUEST)

            comments = Comment.objects.filter(lesson_id=lesson_id)
            if not comments:  # Kiểm tra nếu không có comment nào cho lesson_id này
                return Response({"message": "No comments found for the lesson."}, status=status.HTTP_200_OK)

            serializer = serializers.CommentSerializer(comments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer
    permission_classes = [perms.OwnerAuthenticated]


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = serializers.BookSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer
    permission_classes = [perms.OwnerAuthenticated]

    def create(self, request, *args, **kwargs):
        book_id = request.data.get('book')  # ID sách từ frontend
        user = request.user  # Lấy user từ request

        # Lấy thêm thông tin cần thiết từ frontend
        book_name = request.data.get('book_name')
        book_price = request.data.get('price')

        # Kiểm tra xem sách có tồn tại không
        try:
            book = Book.objects.get(id=book_id)  # Lấy instance của Book
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        # Tạo đối tượng thanh toán PayPal
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:8000/payments/webhook/success/",
                "cancel_url": "http://localhost:8000/payments/webhook/cancel/"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": book_name,  # Tên sách
                        "sku": book_id,  # ID sách
                        "price": book_price,  # Giá sách
                        "currency": "USD",  # Đơn vị tiền tệ
                        "quantity": 1  # Số lượng
                    }]
                },
                "amount": {
                    "total": book_price,  # Tổng số tiền
                    "currency": "USD"  # Đơn vị tiền tệ
                },
                "description": "Payment for book purchase"  # Mô tả
            }]
        })

        # Thực hiện thanh toán
        if payment.create():
            print("Payment created successfully")
            # Lưu user, book, paypal_id và status vào DB
            Payment.objects.create(user=user, book=book, paypal_id=payment.id, status="Pending")
            return_url = payment.links[1].href  # Lấy đường dẫn thanh toán
            return Response({"payment_id": payment.id, "redirect_url": return_url}, status=status.HTTP_201_CREATED)
        else:
            print(payment.error)  # In ra lỗi nếu có
            return Response(payment.error, status=status.HTTP_400_BAD_REQUEST)

    # def paypal_webhook_success(self, request):
    #     # Webhook xử lý khi thanh toán thành công từ PayPal
    #     payment_id = request.data.get('paymentId')
    #     payer_id = request.data.get('PayerID')
    #
    #     try:
    #         payment = paypalrestsdk.Payment.find(payment_id)
    #         if payment.execute({"payer_id": payer_id}):
    #             # Cập nhật trạng thái thanh toán và xử lý giảm số dư người dùng
    #             Payment.objects.filter(payment_id=payment_id).update(status="Completed")
    #             return Response({"message": "Payment executed successfully"}, status=status.HTTP_200_OK)
    #         else:
    #             return Response(payment.error, status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])  # Sử dụng GET cho webhook thành công
@permission_classes([permissions.AllowAny])
def paypal_webhook_success(request):
    payment_id = request.GET.get('paymentId')
    payer_id = request.GET.get('PayerID')

    # Kiểm tra xem payment_id và payer_id có tồn tại không
    if not payment_id or not payer_id:
        return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        if payment.execute({"payer_id": payer_id}):
            # Cập nhật trạng thái thanh toán
            Payment.objects.filter(paypal_id=payment_id).update(status="Completed")  # Cập nhật theo paypal_id
            # return Response({"message": "Payment executed successfully"}, status=status.HTTP_200_OK)

            # Render template thanh toán thành công
            return render(request, 'courses/payment_success.html', {
                'payment_id': payment_id,
                'payer_id': payer_id,
                'amount': payment.transactions[0].amount.total,
                'currency': payment.transactions[0].amount.currency,
            })
        else:
            return Response(payment.error, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def paypal_webhook_cancel(request):
    return Response({"message": "Payment cancelled"}, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True).all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action.__eq__('current_user'):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', url_name='current-user', detail=False)
    def current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)
