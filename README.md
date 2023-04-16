# EJS

1. Layouts / Partials
	1. Take out the duplicate parts on each page (e.g. header, footer) as a seperate ejs
	2. https://ejs.co/ (Tags)

2. views, public
  	1. `views`: This is where the view engine by default will go and look for the files that you're trying to render.
  	2. `public`: Express only serves up the main access point which we define in our `package.json` as `app.js` and it also serves up the `views` folder.

  		1. So normally, developers will create a new folder called `public` and inside this public folder you can have your CSS folder and you can have your Javascript folder, you can have your images folder and we can tell Express to serve up this public folder as a static resource.
		2. `app.use(express.static("public"));`

# JavaScript

1. `exports`
	1. date module
	


# Express

1. Route parameters

2. Chained Route Handlers (Not used in this project but been useful in REST API)
	e.g.
	```js
	app.route('/book')
	.get((req, res) => {
		res.send('Get a random book')
	})
	.post((req, res) => {
		res.send('Add a book')
	})
	.put((req, res) => {
		res.send('Update the book')
	})
	```

