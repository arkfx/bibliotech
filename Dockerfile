# Use an official PHP image with Apache
FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies required for PHP extensions
# libpq-dev: for pdo_pgsql
# libzip-dev, unzip: for zip extension (good for Composer, general utility)
# libpng-dev, libjpeg-dev, libfreetype6-dev: for gd extension
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
# pdo & pdo_pgsql: for PostgreSQL database access
# gd: for image manipulation (if needed)
# zip: for handling zip files
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_pgsql gd zip

# Enable Apache rewrite module (commonly used for clean URLs)
RUN a2enmod rewrite

# Copy application files from the current directory (where Dockerfile is) to the container
COPY . /var/www/html/

# Create a custom virtual host configuration
RUN echo '<VirtualHost *:80>\n\
    ServerAdmin webmaster@localhost\n\
    DocumentRoot /var/www/html\n\
    DirectoryIndex view/home.html\n\
    \n\
    <Directory /var/www/html>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    \n\
    # Explicit alias for each HTML file\n\
    AliasMatch "^/([^/]+\.html)$" "/var/www/html/view/$1"\n\
    \n\
    # Alias for the public directory\n\
    Alias /public /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    \n\
    # Define custom error handling\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Set permissions for Apache if necessary.
# Apache runs as www-data. Session files and any upload/cache directories need to be writable.
# The base image usually handles session path permissions.
# If you have specific upload or cache directories, uncomment and modify the following:
# RUN chown -R www-data:www-data /var/www/html/your-writable-directory
# RUN chmod -R 775 /var/www/html/your-writable-directory

# Application loads .env file. Ensure this file is provided at runtime.
# A .env.example should be in your repository to guide users.

# Expose port 80 for Apache
EXPOSE 80

# The base php:8.2-apache image already sets the CMD to apache2-foreground
# CMD ["apache2-foreground"] 