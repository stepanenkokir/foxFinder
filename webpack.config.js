module.exports = {
    entry: "./src/client/js/app.js",
    mode: "production",
    output: {
        path: require("path").resolve("./src/client/js"),
        library:"app",
        filename: "app_res.js"
    },
    module:{
        rules: [
            {
                //test: /\.m?js$/,
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'                    
                }
            }
        ]
    }
};

