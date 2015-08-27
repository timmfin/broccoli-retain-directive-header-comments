## broccoli-retain-directive-header-comments

Broccoli plugin that converts "regular" comments in CoffeeScript and SASS into block comments, so they are retained after transpilation.

I'm using this in conjunction with https://github.com/timmfin/sprockets-directive-loader so that Sprockets-style directive comments (like `#= require ...`) are still available in the compiled JS and CSS output.

#### CoffeeScript Examples

```coffeescript
#= require ./other.js

# is converted to ...

###= require ./other.js ###`
```

```coffeescript
#= require ./other.js
###= require ./two.js
#= require ./three.js
###

# is converted to ...

###= require ./other.js ###
###= require ./two.js ###
###= require ./three.js ###
```

```coffeescript
###= require ./1.js
#= require ./2
#= require ./4 ###

# is converted to ...

###= require ./1.js ###
###= require ./2 ###
###= require ./4 ###
```

       
#### SASS Examples
```sass
//= require ./other.css

// is converted to ...

/*= require ./other.css */
```

```sass
//= require ./other.css
//= require ./two.css

// is converted to ...

/*= require ./other.css */
/*= require ./two.css */
```

```sass
//= require ./other.css
/*= require ./two.css
  = require ./three.css
*/

// is converted to ...

/*= require ./other.css */
/*= require ./two.css */
/*= require ./three.css */
```
