var should = require('chai').should();

var RetainDirectiveHeaderFilter = require('./index.js');



function dedent(callSite, ...args) {

  function format(str) {
    let size = -1;

    return str.replace(/\n(\s+)/g, (m, m1) => {

      if (size < 0)
        size = m1.replace(/\t/g, "    ").length;

      return "\n" + m1.slice(Math.min(m1.length, size));
    });
  }

  if (typeof callSite === "string")
    return format(callSite);

  if (typeof callSite === "function")
    return (...args) => format(callSite(...args));

  let output = callSite
    .slice(0, args.length + 1)
    .map((text, i) => (i === 0 ? "" : args[i - 1]) + text)
    .join("");

  return format(output);
}


describe('RetainDirectiveHeaderFilter', () => {
  it('should instantiate', () => {
    let filter = new RetainDirectiveHeaderFilter('/tmp/blaaaaaaaa', {
      persist: false
    });

    filter.should.exist;
  });

  describe('processString', () => {
    let filter;

    beforeEach(() => {
      filter = new RetainDirectiveHeaderFilter('/tmp/blaaaaaaaa', {
        persist: false
      });
    });

    it('should do nothing to an empty file', () => {
      filter.processString("", "bla.coffee").should.equal("");
    });

    describe('CoffeeScript', () => {
      it('should block commentify a single directive', () => {
        let header      = "#= require ./other.js";
        let expectation = "###= require ./other.js ###";

        filter.processString(header, "bla.coffee").should.equal(expectation);
      });

      it('should block commentify a couple directives', () => {
        let header = dedent`#= require ./other.js
        #= require ./two.js`;

        let expectation = dedent`###= require ./other.js ###
        ###= require ./two.js ###`;

        filter.processString(header, "bla.coffee").should.equal(expectation);
      });

      it('should modify existing block comments', () => {
        let header = dedent`#= require ./other.js
        ###= require ./two.js
        #= require ./three.js
        ###`;

        let expectation = dedent`###= require ./other.js ###
        ###= require ./two.js ###
        ###= require ./three.js ###`;

        filter.processString(header, "bla.coffee").trim().should.equal(expectation);
      });

      it('should modify existing block comments 2', () => {
        let header = dedent`###= require ./1.js
#= require ./2
#= require ./4 ###`;

        let expectation = dedent`###= require ./1.js ###
###= require ./2 ###
###= require ./4 ###`;

        filter.processString(header, "bla.coffee").trim().should.equal(expectation);
      });



      // This doesn't work, but when checking our whole HubSpot code base, I only
      // found it in one place: https://git.hubteam.com/HubSpot/Content/blob/ddcce9d6fc1795da1a6ac3b17cd829571f540ac8/content_web/static/test/spec/specs.coffee#L3-L6
      xit('should not mess with existing block comments that do not have directives', () => {
        let header = dedent`###
        bla bla bla
        ###`;

        let expectation = dedent`###
        bla bla bla
        ###`;;

        filter.processString(header, "bla.coffee").trim().should.equal(expectation);
      });
    });

    describe('Sass', () => {
      it('should block commentify a single directive', () => {
        let header      = "//= require ./other.css";
        let expectation = "/*= require ./other.css */";

        filter.processString(header, "bla.scss").should.equal(expectation);
        filter.processString(header, "bla.sass").should.equal(expectation);
      });

      it('should block commentify a couple directives', () => {
        let header = dedent`//= require ./other.css
        //= require ./two.css`;

        let expectation = dedent`/*= require ./other.css */
        /*= require ./two.css */`;

        filter.processString(header, "bla.scss").should.equal(expectation);
        filter.processString(header, "bla.sass").should.equal(expectation);
      });

      it('should modify existing block comments', () => {
        let header = dedent`//= require ./other.css
        /*= require ./two.css
          = require ./three.css
        */`;

        let expectation = dedent`/*= require ./other.css */
        /*= require ./two.css */
        /*= require ./three.css */`;

        filter.processString(header, "bla.scss").trim().should.equal(expectation);
        filter.processString(header, "bla.sass").trim().should.equal(expectation);
      });
    });
  })
});
