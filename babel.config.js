const presets = [
  [
    "@babel/env",
    {
      "targets": {
        "browsers": [
          "> 0.5%",
          "last 2 versions"
        ]
      },
      useBuiltIns: "entry",
      corejs: "3.6.4",
    },
  ],
];

module.exports = { presets };
