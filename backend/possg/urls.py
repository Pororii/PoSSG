from django.urls import path

from .views import CreateUserFolder, UserFoldersInfoView, ImageUploadView , FileUploadView, SearchFilesView, DeleteUserFileView, PortfolioByFolderView, PortfolioMakeView, UserPortfolioView, RecommendView, EditPortfolioView, PortfolioDownloadView

#from .views import make_folder_portfolio

from django.conf.urls.static import static
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('create', CreateUserFolder.as_view(), name='create-folder'),
    path('thumbnail-upload', ImageUploadView.as_view(), name='image-upload'),
    path('folder', UserFoldersInfoView.as_view(), name='folders-info'),

    path('upload', FileUploadView.as_view(), name='file-upload'),
    path('files', SearchFilesView.as_view(), name='search-files'),
    path('file-remove', DeleteUserFileView.as_view(), name='delete-user-file'),
    path('folder-portfolio', PortfolioByFolderView.as_view(), name='portfolio-by-folder'),
    path('make-portfolio', PortfolioMakeView.as_view(), name='portfolio-total'),
    path('total-portfolio', UserPortfolioView.as_view(), name='user-portfolio'),
    
    path('recommend', RecommendView.as_view(), name='user-portfolio'),
    path('ask-recommend', RecommendView.as_view(), name='user-portfolio'),
    
    path('edit-portfolio', EditPortfolioView.as_view(), name='edit-portfolio'),
    path('portfolio-download', PortfolioDownloadView.as_view(), name='download-portfolio'),

]

