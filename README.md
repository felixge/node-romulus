# romulus

Building static empires with node.js.

**Install:** `[sudo] npm install -g romulus`

<a href="http://en.wikipedia.org/wiki/File:Jean_Auguste_Dominique_Ingres_019.jpg">
  <img width="640" src="./node-romulus/raw/master/romulus.jpg">
</a>

## Features

Romulus is a static site generator (like jekyll) featuring:

* a clear folder convention
* ejs template processing
* generating css from less files
* github flavored markdown
* a local development server behaving like github pages

**Planned:**

* `romulus deploy` for github pages deployment
* page scripts that run before rendering
* partials that can be included on any page
* plugins (themes, blogging, google analytics, disqus, etc.)

You should use romulus if you want a simple tool for creating static github
pages with node.js.

## Creating a static page

Create a new directory, and inside this directory create the folder structure below:

**Note:** Only the `pages` folder is required, the other folders are optional.

```
/pages
/layouts
/public
```

Now create a file called `pages/index.html` and put some HTML into it:

```html
<p>Hello World</p>
```

Run this to build your static site:

```bash
$ romulus build my-site
```

You should now see a new folder called `my-site` containing your `index.html`
page exactly as you wrote it.

**Note:** If you ommit the `my-site` argument, romulus will default to naming
your output folder `build`.

For testing your site, you should run the local development server at
[http://localhost:8080/](http://localhost:8080/) by typing this:

```bash
$ romulus
```

## Layouts

In order to make this more interesting, let's say you want to wrap your new
page in a fancy layout. To do this you need to change your `pages/index.html`
file like this:

```html
<% this.layout = 'default' %>
<p>Hello World</p>
```

Now you need to create the layout itself, so add a file called
`layouts/default.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>My static empire</title>

    <!-- Can be a plain css file or rendered from less, continue reading -->
    <link rel="stylesheet" type="text/css" href="/css/main.css" />
    <!-- You can include any JS / CSS files, main.js / main.css are just examples -->
    <script src="/js/main.js"></script>
  </head>
  <body>
    <h1>My Header</h1>
    <%- page %>
  </body>
</html>
```

That's it, you should now see your page being rendered inside your template!

## Accessing page variables in your layout

Let's say you want to set a `title` variable in your page that should be used
by the layout. For this, add this to your page template:

```html
<% this.title = 'My title'; %>
```

And output it in your layout like this:

```html
<title><%= this.title %></title>
```

## Generating css from less files

Now that you have this wonderful site, you probably want to style it. To do so,
create a file called `public/css/main.less`:

```css
body{
  h1{
    color: #0080FF;
  }
}
```

Sweet, your headline is now featuring my favorite color!

## Static file support

Any file placed in the `public` folder will be included at the top level of the
build output folder. The local development server also supports serving them.

## Using markdown

romulus natively supports
[github flavored markdown](https://github.com/isaacs/github-flavored-markdown)
for page files. Using markdown is as easy as creating a file with
a `.md` extension like `pages/markdown-rocks.md` and adding some markdown to it:

```html
<% this.layout = 'default'; %>

Markdown is **fun**, and you can still use EJS inside of your markdown
templates.
```

This page now will be served at `/markdown-rocks`.

## Page scripts

```
work in progress ...
```
## Deploying to github pages

```
work in progress ...
```
## License

MIT License.
