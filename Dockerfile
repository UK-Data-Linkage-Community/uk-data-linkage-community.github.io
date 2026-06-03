FROM ruby:3.3-slim

# Install minimal dependencies for native gems
RUN apt-get update -qq && apt-get install -y \
  libxml2-dev \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /site

# Copy dependency files first (for caching)
COPY Gemfile Gemfile.lock ./

# Install bundler + gems
RUN gem install bundler -v 2.7.2 && bundle install

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload"]