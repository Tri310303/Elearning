from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    avatar = CloudinaryField('avatar', null=True)


class BaseModel(models.Model):
    created_date = models.DateField(auto_now_add=True, null=True)
    updated_date = models.DateField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Category(BaseModel):
    name = models.CharField(max_length=50, null=False)

    def __str__(self):
        return self.name


class Course(BaseModel):
    subject = models.CharField(max_length=255, null=False)
    description = RichTextField()
    image = models.ImageField(upload_to='courses/%Y/%m')
    category = models.ForeignKey(Category, on_delete=models.RESTRICT, related_query_name='courses')
    tags = models.ManyToManyField('Tag')

    def __str__(self):
        return self.subject

    class Meta:
        unique_together = ('subject', 'category')


class Lesson(BaseModel):
    subject = models.CharField(max_length=255)
    content = RichTextField()
    image = CloudinaryField('image', null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tags = models.ManyToManyField('Tag')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.subject

    class Meta:
        unique_together = ('subject', 'course')


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)


class Like(Interaction):
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'lesson')


class Assignment(Interaction):
    file = models.FileField(upload_to='assignments/', null=True, blank=True)


class Book(BaseModel):
    name = models.CharField(max_length=100, null=False)
    content = RichTextField()
    image = models.ImageField(upload_to='books/%Y/%m')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    author = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.name


class Payment(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    address = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    paypal_id = models.CharField(max_length=255, null=True, blank=True)  # Thêm trường để lưu ID giao dịch PayPal
    status = models.CharField(max_length=50, default='Pending')  # Trường để lưu trạng thái thanh toán

    class Meta:
        unique_together = ('user', 'book')


class Forum(BaseModel):
    name = models.CharField(max_length=100, null=False)
    content = RichTextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Statistics(BaseModel):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE)
    comment_count = models.ForeignKey(Comment, on_delete=models.CASCADE)
    like_count = models.ForeignKey(Like, on_delete=models.CASCADE)
