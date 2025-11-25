FROM ruby:3.2.8

ARG RAILS_MASTER_KEY

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
    RAILS_SERVE_STATIC_FILES=true \
    SECRET_KEY_BASE=dummy \
    RAILS_MASTER_KEY=${RAILS_MASTER_KEY}

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN rm -f tmp/pids/server.pid

EXPOSE 3000

CMD ["bash", "-c", "bundle exec rails webpacker:compile && bundle exec rails assets:precompile && bundle exec rails db:prepare && bundle exec rails server -b 0.0.0.0"]