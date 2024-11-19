from courses.models import Category, Course, Tag, Lesson, User, Comment, Assignment, Book, Payment
from rest_framework import serializers


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class BaseSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(source='image')
    tags = TagSerializer(many=True)

    def get_image(self, course):
        if course.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri('/static/%s' % course.image.name)

            return '/static/%s' % course.image.name


class CourseSerializer(BaseSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all())

    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'image', 'tags', 'content', 'course', 'user', 'created_date', 'updated_date']


class LessonDetailsSerializer(LessonSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, lesson):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return lesson.like_set.filter(active=True).exists()

    class Meta:
        model = LessonSerializer.Meta.model
        fields = LessonSerializer.Meta.fields + ['liked']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'password', 'is_superuser', 'is_staff',
                  'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data['password'])
        user.save()

        return user


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user']


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'file', 'user', 'lesson']


class BookSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(source='image')

    def get_image(self, course):
        if course.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri('/static/%s' % course.image.name)

            return '/static/%s' % course.image.name

    class Meta:
        model = Book
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

