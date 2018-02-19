const webpack = require("webpack");
const path = require("path");

var jF = path.resolve(__dirname,"scripts");
var bF = path.resolve(__dirname,"build");

var config = {
    entry:{
        "main":jF +"/main.js",
        "post":jF+"/post.js",
        "room":jF+"/room.js"
    },
    output:{
        filename:"[name]bundle.js",
        path:bF
    },
    plugins:[
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery"
        })
    ]
}

module.exports = config;