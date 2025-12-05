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
    NODE_OPTIONS=--openssl-legacy-provider

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 100000

COPY . .

ENV SECRET_KEY_BASE=precompile_placeholder \
    PG_USER=dummy \
    PG_PASSWORD=dummy \
    PG_HOST=dummy \
    PG_PORT=5432

RUN bundle exec rails webpacker:compile
RUN bundle exec rails assets:precompile

RUN rm -f tmp/pids/server.pid

EXPOSE 3000

CMD ["bash", "-c", "bundle exec rails db:prepare && bundle exec rails server -b 0.0.0.0"]