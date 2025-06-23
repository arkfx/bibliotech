FROM php:8.2-apache

WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_pgsql gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache rewrite module and headers
RUN a2enmod rewrite headers

# Configure PHP for production
RUN echo "display_errors = Off" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "display_startup_errors = Off" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "log_errors = On" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "error_log = /var/log/apache2/php_errors.log" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "html_errors = Off" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "expose_php = Off" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "max_execution_time = 30" >> /usr/local/etc/php/conf.d/production.ini && \
    echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/production.ini

# Copy the entire application first
COPY . /var/www/html/

# Fix case sensitivity for controllers directory if needed
RUN if [ -d "/var/www/html/Controllers" ]; then \
        mv /var/www/html/Controllers /var/www/html/controllers_temp && \
        mv /var/www/html/controllers_temp /var/www/html/controllers; \
    fi

# Fix controller directory path in public/index.php
RUN sed -i 's|Controllers|controllers|g' /var/www/html/public/index.php

# Fix JavaScript config for production
RUN sed -i 's|const path = window.location.pathname;|const path = window.location.pathname;|g' /var/www/html/public/js/config.js && \
    sed -i 's|if (path.includes("/bibliotech/view/")) {|if (path.includes("/bibliotech/view/") \|\| path.includes("/view/")) {|g' /var/www/html/public/js/config.js && \
    sed -i 's|} else if (path.includes("/bibliotech")) {|} else if (path.includes("/bibliotech") \|\| window.location.hostname.includes("run.app")) {|g' /var/www/html/public/js/config.js

# Clear composer cache and install dependencies
RUN composer clear-cache && \
    composer install --no-dev --optimize-autoloader --no-interaction --no-cache && \
    composer dump-autoload --optimize --no-dev

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chown -R www-data:www-data /var/www/html/vendor \
    && chmod -R 755 /var/www/html/vendor

# Configure Apache virtual host with proper routing
RUN echo '<VirtualHost *:80>\n\
    ServerAdmin webmaster@localhost\n\
    DocumentRoot /var/www/html\n\
    \n\
    <Directory /var/www/html>\n\
        Options -Indexes +FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    \n\
    # Alias for public directory assets\n\
    Alias /public /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        Options -Indexes +FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
        \n\
        # Set proper MIME type for JavaScript modules\n\
        <FilesMatch "\.js$">\n\
            Header set Content-Type "application/javascript"\n\
        </FilesMatch>\n\
    </Directory>\n\
    \n\
    # Logging\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

EXPOSE 80
