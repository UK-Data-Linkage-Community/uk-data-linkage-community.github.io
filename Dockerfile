FROM ruby:3.3-slim

# Install minimal dependencies for native gems
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libffi-dev \
  libxml2-dev \
  libxslt1-dev \
  zlib1g-dev \
  git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /site

# Copy dependency files first (for caching)
COPY Gemfile Gemfile.lock ./

# Install bundler + gems
RUN gem install bundler && bundle install

# Copy the rest of the project
COPY . .

COPY _* .
COPY assets .
COPY collections .
COPY _config.yml .
COPY index.md .
COPY favicon.ico .
COPY 404.html .

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload"]