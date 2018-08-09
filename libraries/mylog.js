var mylog = (function () {
    return {
        log: function() {
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        },
        warn: function() {
            var args = Array.prototype.slice.call(arguments);
            console.warn.apply(console, args);
        },
        error: function() {
            var args = Array.prototype.slice.call(arguments);
            console.error.apply(console, args);
        }
    }
}());

/* var name = "Alex";
var arr = [1, 2, 3];
var obj = { a:1, b:2, c:3 };
var hello = function(msg){alert(msg);};
mylog.log("Name: ", name);
mylog.log("Window Debug: ", window);
mylog.error("Something error happen");
mylog.warn("Ahh... Warning", arr, obj);
mylog.log("more parameter: ", arr, obj, hello); */