FROM ruby:3.2.8

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    curl \
    git \
    libpq-dev \
    libvips \
    postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

WORKDIR /rails

ENV RAILS_ENV=production \
    NODE_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=true

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 100000

COPY babel.config.js ./
COPY tsconfig.json ./
COPY config/webpacker.yml ./config/
COPY app/javascript ./app/javascript

RUN SECRET_KEY_BASE=dummy RAILS_ENV=production NODE_ENV=production bundle exec rails webpacker:compile

COPY . .

RUN rm -f tmp/pids/server.pid

EXPOSE 3000

CMD ["bash", "-c", "bundle exec rails db:prepare && bundle exec rails server -b 0.0.0.0"]