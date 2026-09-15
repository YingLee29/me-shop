FROM php:8.4-fpm-alpine

# ── Cài system dependencies ──
RUN apk add --no-cache \
    bash \
    curl \
    git \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    icu-dev \
    linux-headers

# ── Cài PHP extensions ──
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        zip \
        gd \
        opcache \
        pcntl \
        bcmath \
        intl

# ── Redis extension (PECL) ──
RUN apk add --no-cache --virtual .build-deps autoconf gcc g++ make \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# ── Cài Composer ──
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# ── Working directory ──
WORKDIR /var/www/backend

# ── Permissions ──
RUN addgroup -g 1000 www \
    && adduser -u 1000 -G www -D www \
    && chown -R www:www /var/www

USER www

EXPOSE 9000
CMD ["php-fpm"]
