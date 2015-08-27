## broccoli-retain-directive-header-comments

Broccoli plugin that converts "regular" comments in CoffeeScript and SASS into block comments, so they are retained after transpilation.

I'm using this in conjunction with https://github.com/timmfin/sprockets-directive-loader so that Sprockets-style directive comments (like `#= require ...`) are still available in the compiled JS and CSS output.

_Note, this is not 100% perfect. There is (at least) one case I know doesn't work that I'm intentionally ignoring for now. [See the ignored test](https://github.com/timmfin/broccoli-retain-directive-header-comments/blob/53c0852dabc6f037ec95debdbdffa01086375c49/test.js#L103-L114).

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
