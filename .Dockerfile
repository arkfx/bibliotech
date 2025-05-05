# Usa uma imagem oficial do PHP com Apache
FROM php:8.2-apache

# Instala extensões necessárias (pdo_pgsql para PostgreSQL)
RUN apt-get update && \
    apt-get install -y libpq-dev git unzip && \
    docker-php-ext-install pdo pdo_pgsql

# Copia o código do projeto para o container
COPY . /var/www/html

# Define o diretório de trabalho
WORKDIR /var/www/html

# Permissões para o Apache acessar os arquivos
RUN chown -R www-data:www-data /var/www/html

# Habilita o mod_rewrite do Apache (útil para rotas amigáveis)
RUN a2enmod rewrite

# Configura o Apache para servir a partir da pasta public (ajuste se necessário)
# Se o index.php está em /public, descomente as linhas abaixo:
# RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf
# WORKDIR /var/www/html/public

# Expõe a porta padrão do Apache
EXPOSE 8080

# Google Cloud Run espera que o serviço escute na porta 8080
ENV PORT=8080

# Inicia o Apache em foreground
CMD ["apache2-foreground"]