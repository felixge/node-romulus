# romulus

Building static empires with node.js.

**Install:** `[sudo] npm install -g romulus`

<a href="http://en.wikipedia.org/wiki/File:Jean_Auguste_Dominique_Ingres_019.jpg">
  <img width="640" src="./node-romulus/raw/master/romulus-ftw.jpg">
</a>

## Features

Romlus is a static site generator (like jekyll) featuring:

* a clear folder convention
* ejs template processing
* generating css from less files
* a local development server acting like github pages

**Planned:**

* `romulus deploy` for github pages deployment
* page scripts that run before rendering
* github flavored markdown
* blogging

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

Run this to generate your static site:

```bash
$ romlus my-site
```

You should now see a new folder called `my-site` containing your `index.html`
page exactly as you wrote it.

Alternatively you could run the local development server at
[http://localhost:8080/](http://localhost:8080/) by typing this:

```bash
$ romulus
```

## Layouts

In order to make this more interesting, let's say you want to wrap your
new page in a fancy layout. To do this you need to change you `pages/index.html`
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

    <link rel="stylesheet" type="text/css" href="/css/main.css" />
    <script src="/js/main.js"></script>
  </head>
  <body>
    <h1>My Header</h1>
    <%- page %>
  </body>
</html>
```

That's it, you should now see your page being rendered inside your template!

## Generating css from less files

Now that you have this wonderful site, you probably want to style it. To do so,
create a file called `public/css/main.css`:

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
