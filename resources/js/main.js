var App = function (data_base_url) {
  this.data_base_url = data_base_url;

  //if(top != self) {
  //  window.open(location.href, '_top');
  // }

  this.frequency = {
      'temperature-chart': 'annual',
      'precipitation-chart': 'annual',
      'derived-chart': 'annual'
  };
  this.handleOutboundLinks();
  this.getCountyCodes();
  this.tour();
};



App.prototype.handleOutboundLinks = function() {


  var comp = new RegExp(location.host);

  var nodes = document.getElementsByTagName("a"), i = nodes.length;
  var regExp = new RegExp("//" + location.host + "($|/)");
  while(i--){
    var href = nodes[i].href;
    var isLocal = (href.substring(0,4) === "http") ? regExp.test(href) : true;
    var classAdd = (isLocal) ? "local" : "external";
    nodes[i].className += " "+ classAdd;
  }

  $('#header-logo').removeClass('external').addClass('local');

  $('a').on('click', function(e) {
    var loc = $(this).attr('href');

    if ( !$(this).hasClass('local')) {
      e.preventDefault();
      e.stopPropagation();

      swal({
        title: "You are exiting an NCEI website.",
        text: "Thank you for visiting our site. We have provided a link because it has information that may interest you. NCEI does not endorse the views expressed, the information presented, or any commercial products that may be advertised or available on that site.",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#2470D2",
        confirmButtonText: "Continue",
        closeOnConfirm: true
      },
        function(){
          window.location = loc;
        });
    }

  });
};


App.prototype.getCountyCodes = function () {
    var self = this;
    this.fips_codes = null;
    $.getJSON(this.data_base_url + 'fips_codes.json', function (data) {
        self.fips_codes = data;
        self.locationSearch();
    });
};


App.prototype.locationSearch = function () {
    var self = this;

    $(".location-mapper").formmapper({
        details: "form"
    });

    var Latinise = {};
    Latinise.latin_map = {
        "Á": "A",
        "Ă": "A",
        "Ắ": "A",
        "Ặ": "A",
        "Ằ": "A",
        "Ẳ": "A",
        "Ẵ": "A",
        "Ǎ": "A",
        "Â": "A",
        "Ấ": "A",
        "Ậ": "A",
        "Ầ": "A",
        "Ẩ": "A",
        "Ẫ": "A",
        "Ä": "A",
        "Ǟ": "A",
        "Ȧ": "A",
        "Ǡ": "A",
        "Ạ": "A",
        "Ȁ": "A",
        "À": "A",
        "Ả": "A",
        "Ȃ": "A",
        "Ā": "A",
        "Ą": "A",
        "Å": "A",
        "Ǻ": "A",
        "Ḁ": "A",
        "Ⱥ": "A",
        "Ã": "A",
        "Ꜳ": "AA",
        "Æ": "AE",
        "Ǽ": "AE",
        "Ǣ": "AE",
        "Ꜵ": "AO",
        "Ꜷ": "AU",
        "Ꜹ": "AV",
        "Ꜻ": "AV",
        "Ꜽ": "AY",
        "Ḃ": "B",
        "Ḅ": "B",
        "Ɓ": "B",
        "Ḇ": "B",
        "Ƀ": "B",
        "Ƃ": "B",
        "Ć": "C",
        "Č": "C",
        "Ç": "C",
        "Ḉ": "C",
        "Ĉ": "C",
        "Ċ": "C",
        "Ƈ": "C",
        "Ȼ": "C",
        "Ď": "D",
        "Ḑ": "D",
        "Ḓ": "D",
        "Ḋ": "D",
        "Ḍ": "D",
        "Ɗ": "D",
        "Ḏ": "D",
        "ǲ": "D",
        "ǅ": "D",
        "Đ": "D",
        "Ƌ": "D",
        "Ǳ": "DZ",
        "Ǆ": "DZ",
        "É": "E",
        "Ĕ": "E",
        "Ě": "E",
        "Ȩ": "E",
        "Ḝ": "E",
        "Ê": "E",
        "Ế": "E",
        "Ệ": "E",
        "Ề": "E",
        "Ể": "E",
        "Ễ": "E",
        "Ḙ": "E",
        "Ë": "E",
        "Ė": "E",
        "Ẹ": "E",
        "Ȅ": "E",
        "È": "E",
        "Ẻ": "E",
        "Ȇ": "E",
        "Ē": "E",
        "Ḗ": "E",
        "Ḕ": "E",
        "Ę": "E",
        "Ɇ": "E",
        "Ẽ": "E",
        "Ḛ": "E",
        "Ꝫ": "ET",
        "Ḟ": "F",
        "Ƒ": "F",
        "Ǵ": "G",
        "Ğ": "G",
        "Ǧ": "G",
        "Ģ": "G",
        "Ĝ": "G",
        "Ġ": "G",
        "Ɠ": "G",
        "Ḡ": "G",
        "Ǥ": "G",
        "Ḫ": "H",
        "Ȟ": "H",
        "Ḩ": "H",
        "Ĥ": "H",
        "Ⱨ": "H",
        "Ḧ": "H",
        "Ḣ": "H",
        "Ḥ": "H",
        "Ħ": "H",
        "Í": "I",
        "Ĭ": "I",
        "Ǐ": "I",
        "Î": "I",
        "Ï": "I",
        "Ḯ": "I",
        "İ": "I",
        "Ị": "I",
        "Ȉ": "I",
        "Ì": "I",
        "Ỉ": "I",
        "Ȋ": "I",
        "Ī": "I",
        "Į": "I",
        "Ɨ": "I",
        "Ĩ": "I",
        "Ḭ": "I",
        "Ꝺ": "D",
        "Ꝼ": "F",
        "Ᵹ": "G",
        "Ꞃ": "R",
        "Ꞅ": "S",
        "Ꞇ": "T",
        "Ꝭ": "IS",
        "Ĵ": "J",
        "Ɉ": "J",
        "Ḱ": "K",
        "Ǩ": "K",
        "Ķ": "K",
        "Ⱪ": "K",
        "Ꝃ": "K",
        "Ḳ": "K",
        "Ƙ": "K",
        "Ḵ": "K",
        "Ꝁ": "K",
        "Ꝅ": "K",
        "Ĺ": "L",
        "Ƚ": "L",
        "Ľ": "L",
        "Ļ": "L",
        "Ḽ": "L",
        "Ḷ": "L",
        "Ḹ": "L",
        "Ⱡ": "L",
        "Ꝉ": "L",
        "Ḻ": "L",
        "Ŀ": "L",
        "Ɫ": "L",
        "ǈ": "L",
        "Ł": "L",
        "Ǉ": "LJ",
        "Ḿ": "M",
        "Ṁ": "M",
        "Ṃ": "M",
        "Ɱ": "M",
        "Ń": "N",
        "Ň": "N",
        "Ņ": "N",
        "Ṋ": "N",
        "Ṅ": "N",
        "Ṇ": "N",
        "Ǹ": "N",
        "Ɲ": "N",
        "Ṉ": "N",
        "Ƞ": "N",
        "ǋ": "N",
        "Ñ": "N",
        "Ǌ": "NJ",
        "Ó": "O",
        "Ŏ": "O",
        "Ǒ": "O",
        "Ô": "O",
        "Ố": "O",
        "Ộ": "O",
        "Ồ": "O",
        "Ổ": "O",
        "Ỗ": "O",
        "Ö": "O",
        "Ȫ": "O",
        "Ȯ": "O",
        "Ȱ": "O",
        "Ọ": "O",
        "Ő": "O",
        "Ȍ": "O",
        "Ò": "O",
        "Ỏ": "O",
        "Ơ": "O",
        "Ớ": "O",
        "Ợ": "O",
        "Ờ": "O",
        "Ở": "O",
        "Ỡ": "O",
        "Ȏ": "O",
        "Ꝋ": "O",
        "Ꝍ": "O",
        "Ō": "O",
        "Ṓ": "O",
        "Ṑ": "O",
        "Ɵ": "O",
        "Ǫ": "O",
        "Ǭ": "O",
        "Ø": "O",
        "Ǿ": "O",
        "Õ": "O",
        "Ṍ": "O",
        "Ṏ": "O",
        "Ȭ": "O",
        "Ƣ": "OI",
        "Ꝏ": "OO",
        "Ɛ": "E",
        "Ɔ": "O",
        "Ȣ": "OU",
        "Ṕ": "P",
        "Ṗ": "P",
        "Ꝓ": "P",
        "Ƥ": "P",
        "Ꝕ": "P",
        "Ᵽ": "P",
        "Ꝑ": "P",
        "Ꝙ": "Q",
        "Ꝗ": "Q",
        "Ŕ": "R",
        "Ř": "R",
        "Ŗ": "R",
        "Ṙ": "R",
        "Ṛ": "R",
        "Ṝ": "R",
        "Ȑ": "R",
        "Ȓ": "R",
        "Ṟ": "R",
        "Ɍ": "R",
        "Ɽ": "R",
        "Ꜿ": "C",
        "Ǝ": "E",
        "Ś": "S",
        "Ṥ": "S",
        "Š": "S",
        "Ṧ": "S",
        "Ş": "S",
        "Ŝ": "S",
        "Ș": "S",
        "Ṡ": "S",
        "Ṣ": "S",
        "Ṩ": "S",
        "Ť": "T",
        "Ţ": "T",
        "Ṱ": "T",
        "Ț": "T",
        "Ⱦ": "T",
        "Ṫ": "T",
        "Ṭ": "T",
        "Ƭ": "T",
        "Ṯ": "T",
        "Ʈ": "T",
        "Ŧ": "T",
        "Ɐ": "A",
        "Ꞁ": "L",
        "Ɯ": "M",
        "Ʌ": "V",
        "Ꜩ": "TZ",
        "Ú": "U",
        "Ŭ": "U",
        "Ǔ": "U",
        "Û": "U",
        "Ṷ": "U",
        "Ü": "U",
        "Ǘ": "U",
        "Ǚ": "U",
        "Ǜ": "U",
        "Ǖ": "U",
        "Ṳ": "U",
        "Ụ": "U",
        "Ű": "U",
        "Ȕ": "U",
        "Ù": "U",
        "Ủ": "U",
        "Ư": "U",
        "Ứ": "U",
        "Ự": "U",
        "Ừ": "U",
        "Ử": "U",
        "Ữ": "U",
        "Ȗ": "U",
        "Ū": "U",
        "Ṻ": "U",
        "Ų": "U",
        "Ů": "U",
        "Ũ": "U",
        "Ṹ": "U",
        "Ṵ": "U",
        "Ꝟ": "V",
        "Ṿ": "V",
        "Ʋ": "V",
        "Ṽ": "V",
        "Ꝡ": "VY",
        "Ẃ": "W",
        "Ŵ": "W",
        "Ẅ": "W",
        "Ẇ": "W",
        "Ẉ": "W",
        "Ẁ": "W",
        "Ⱳ": "W",
        "Ẍ": "X",
        "Ẋ": "X",
        "Ý": "Y",
        "Ŷ": "Y",
        "Ÿ": "Y",
        "Ẏ": "Y",
        "Ỵ": "Y",
        "Ỳ": "Y",
        "Ƴ": "Y",
        "Ỷ": "Y",
        "Ỿ": "Y",
        "Ȳ": "Y",
        "Ɏ": "Y",
        "Ỹ": "Y",
        "Ź": "Z",
        "Ž": "Z",
        "Ẑ": "Z",
        "Ⱬ": "Z",
        "Ż": "Z",
        "Ẓ": "Z",
        "Ȥ": "Z",
        "Ẕ": "Z",
        "Ƶ": "Z",
        "Ĳ": "IJ",
        "Œ": "OE",
        "ᴀ": "A",
        "ᴁ": "AE",
        "ʙ": "B",
        "ᴃ": "B",
        "ᴄ": "C",
        "ᴅ": "D",
        "ᴇ": "E",
        "ꜰ": "F",
        "ɢ": "G",
        "ʛ": "G",
        "ʜ": "H",
        "ɪ": "I",
        "ʁ": "R",
        "ᴊ": "J",
        "ᴋ": "K",
        "ʟ": "L",
        "ᴌ": "L",
        "ᴍ": "M",
        "ɴ": "N",
        "ᴏ": "O",
        "ɶ": "OE",
        "ᴐ": "O",
        "ᴕ": "OU",
        "ᴘ": "P",
        "ʀ": "R",
        "ᴎ": "N",
        "ᴙ": "R",
        "ꜱ": "S",
        "ᴛ": "T",
        "ⱻ": "E",
        "ᴚ": "R",
        "ᴜ": "U",
        "ᴠ": "V",
        "ᴡ": "W",
        "ʏ": "Y",
        "ᴢ": "Z",
        "á": "a",
        "ă": "a",
        "ắ": "a",
        "ặ": "a",
        "ằ": "a",
        "ẳ": "a",
        "ẵ": "a",
        "ǎ": "a",
        "â": "a",
        "ấ": "a",
        "ậ": "a",
        "ầ": "a",
        "ẩ": "a",
        "ẫ": "a",
        "ä": "a",
        "ǟ": "a",
        "ȧ": "a",
        "ǡ": "a",
        "ạ": "a",
        "ȁ": "a",
        "à": "a",
        "ả": "a",
        "ȃ": "a",
        "ā": "a",
        "ą": "a",
        "ᶏ": "a",
        "ẚ": "a",
        "å": "a",
        "ǻ": "a",
        "ḁ": "a",
        "ⱥ": "a",
        "ã": "a",
        "ꜳ": "aa",
        "æ": "ae",
        "ǽ": "ae",
        "ǣ": "ae",
        "ꜵ": "ao",
        "ꜷ": "au",
        "ꜹ": "av",
        "ꜻ": "av",
        "ꜽ": "ay",
        "ḃ": "b",
        "ḅ": "b",
        "ɓ": "b",
        "ḇ": "b",
        "ᵬ": "b",
        "ᶀ": "b",
        "ƀ": "b",
        "ƃ": "b",
        "ɵ": "o",
        "ć": "c",
        "č": "c",
        "ç": "c",
        "ḉ": "c",
        "ĉ": "c",
        "ɕ": "c",
        "ċ": "c",
        "ƈ": "c",
        "ȼ": "c",
        "ď": "d",
        "ḑ": "d",
        "ḓ": "d",
        "ȡ": "d",
        "ḋ": "d",
        "ḍ": "d",
        "ɗ": "d",
        "ᶑ": "d",
        "ḏ": "d",
        "ᵭ": "d",
        "ᶁ": "d",
        "đ": "d",
        "ɖ": "d",
        "ƌ": "d",
        "ı": "i",
        "ȷ": "j",
        "ɟ": "j",
        "ʄ": "j",
        "ǳ": "dz",
        "ǆ": "dz",
        "é": "e",
        "ĕ": "e",
        "ě": "e",
        "ȩ": "e",
        "ḝ": "e",
        "ê": "e",
        "ế": "e",
        "ệ": "e",
        "ề": "e",
        "ể": "e",
        "ễ": "e",
        "ḙ": "e",
        "ë": "e",
        "ė": "e",
        "ẹ": "e",
        "ȅ": "e",
        "è": "e",
        "ẻ": "e",
        "ȇ": "e",
        "ē": "e",
        "ḗ": "e",
        "ḕ": "e",
        "ⱸ": "e",
        "ę": "e",
        "ᶒ": "e",
        "ɇ": "e",
        "ẽ": "e",
        "ḛ": "e",
        "ꝫ": "et",
        "ḟ": "f",
        "ƒ": "f",
        "ᵮ": "f",
        "ᶂ": "f",
        "ǵ": "g",
        "ğ": "g",
        "ǧ": "g",
        "ģ": "g",
        "ĝ": "g",
        "ġ": "g",
        "ɠ": "g",
        "ḡ": "g",
        "ᶃ": "g",
        "ǥ": "g",
        "ḫ": "h",
        "ȟ": "h",
        "ḩ": "h",
        "ĥ": "h",
        "ⱨ": "h",
        "ḧ": "h",
        "ḣ": "h",
        "ḥ": "h",
        "ɦ": "h",
        "ẖ": "h",
        "ħ": "h",
        "ƕ": "hv",
        "í": "i",
        "ĭ": "i",
        "ǐ": "i",
        "î": "i",
        "ï": "i",
        "ḯ": "i",
        "ị": "i",
        "ȉ": "i",
        "ì": "i",
        "ỉ": "i",
        "ȋ": "i",
        "ī": "i",
        "į": "i",
        "ᶖ": "i",
        "ɨ": "i",
        "ĩ": "i",
        "ḭ": "i",
        "ꝺ": "d",
        "ꝼ": "f",
        "ᵹ": "g",
        "ꞃ": "r",
        "ꞅ": "s",
        "ꞇ": "t",
        "ꝭ": "is",
        "ǰ": "j",
        "ĵ": "j",
        "ʝ": "j",
        "ɉ": "j",
        "ḱ": "k",
        "ǩ": "k",
        "ķ": "k",
        "ⱪ": "k",
        "ꝃ": "k",
        "ḳ": "k",
        "ƙ": "k",
        "ḵ": "k",
        "ᶄ": "k",
        "ꝁ": "k",
        "ꝅ": "k",
        "ĺ": "l",
        "ƚ": "l",
        "ɬ": "l",
        "ľ": "l",
        "ļ": "l",
        "ḽ": "l",
        "ȴ": "l",
        "ḷ": "l",
        "ḹ": "l",
        "ⱡ": "l",
        "ꝉ": "l",
        "ḻ": "l",
        "ŀ": "l",
        "ɫ": "l",
        "ᶅ": "l",
        "ɭ": "l",
        "ł": "l",
        "ǉ": "lj",
        "ſ": "s",
        "ẜ": "s",
        "ẛ": "s",
        "ẝ": "s",
        "ḿ": "m",
        "ṁ": "m",
        "ṃ": "m",
        "ɱ": "m",
        "ᵯ": "m",
        "ᶆ": "m",
        "ń": "n",
        "ň": "n",
        "ņ": "n",
        "ṋ": "n",
        "ȵ": "n",
        "ṅ": "n",
        "ṇ": "n",
        "ǹ": "n",
        "ɲ": "n",
        "ṉ": "n",
        "ƞ": "n",
        "ᵰ": "n",
        "ᶇ": "n",
        "ɳ": "n",
        "ñ": "n",
        "ǌ": "nj",
        "ó": "o",
        "ŏ": "o",
        "ǒ": "o",
        "ô": "o",
        "ố": "o",
        "ộ": "o",
        "ồ": "o",
        "ổ": "o",
        "ỗ": "o",
        "ö": "o",
        "ȫ": "o",
        "ȯ": "o",
        "ȱ": "o",
        "ọ": "o",
        "ő": "o",
        "ȍ": "o",
        "ò": "o",
        "ỏ": "o",
        "ơ": "o",
        "ớ": "o",
        "ợ": "o",
        "ờ": "o",
        "ở": "o",
        "ỡ": "o",
        "ȏ": "o",
        "ꝋ": "o",
        "ꝍ": "o",
        "ⱺ": "o",
        "ō": "o",
        "ṓ": "o",
        "ṑ": "o",
        "ǫ": "o",
        "ǭ": "o",
        "ø": "o",
        "ǿ": "o",
        "õ": "o",
        "ṍ": "o",
        "ṏ": "o",
        "ȭ": "o",
        "ƣ": "oi",
        "ꝏ": "oo",
        "ɛ": "e",
        "ᶓ": "e",
        "ɔ": "o",
        "ᶗ": "o",
        "ȣ": "ou",
        "ṕ": "p",
        "ṗ": "p",
        "ꝓ": "p",
        "ƥ": "p",
        "ᵱ": "p",
        "ᶈ": "p",
        "ꝕ": "p",
        "ᵽ": "p",
        "ꝑ": "p",
        "ꝙ": "q",
        "ʠ": "q",
        "ɋ": "q",
        "ꝗ": "q",
        "ŕ": "r",
        "ř": "r",
        "ŗ": "r",
        "ṙ": "r",
        "ṛ": "r",
        "ṝ": "r",
        "ȑ": "r",
        "ɾ": "r",
        "ᵳ": "r",
        "ȓ": "r",
        "ṟ": "r",
        "ɼ": "r",
        "ᵲ": "r",
        "ᶉ": "r",
        "ɍ": "r",
        "ɽ": "r",
        "ↄ": "c",
        "ꜿ": "c",
        "ɘ": "e",
        "ɿ": "r",
        "ś": "s",
        "ṥ": "s",
        "š": "s",
        "ṧ": "s",
        "ş": "s",
        "ŝ": "s",
        "ș": "s",
        "ṡ": "s",
        "ṣ": "s",
        "ṩ": "s",
        "ʂ": "s",
        "ᵴ": "s",
        "ᶊ": "s",
        "ȿ": "s",
        "ɡ": "g",
        "ᴑ": "o",
        "ᴓ": "o",
        "ᴝ": "u",
        "ť": "t",
        "ţ": "t",
        "ṱ": "t",
        "ț": "t",
        "ȶ": "t",
        "ẗ": "t",
        "ⱦ": "t",
        "ṫ": "t",
        "ṭ": "t",
        "ƭ": "t",
        "ṯ": "t",
        "ᵵ": "t",
        "ƫ": "t",
        "ʈ": "t",
        "ŧ": "t",
        "ᵺ": "th",
        "ɐ": "a",
        "ᴂ": "ae",
        "ǝ": "e",
        "ᵷ": "g",
        "ɥ": "h",
        "ʮ": "h",
        "ʯ": "h",
        "ᴉ": "i",
        "ʞ": "k",
        "ꞁ": "l",
        "ɯ": "m",
        "ɰ": "m",
        "ᴔ": "oe",
        "ɹ": "r",
        "ɻ": "r",
        "ɺ": "r",
        "ⱹ": "r",
        "ʇ": "t",
        "ʌ": "v",
        "ʍ": "w",
        "ʎ": "y",
        "ꜩ": "tz",
        "ú": "u",
        "ŭ": "u",
        "ǔ": "u",
        "û": "u",
        "ṷ": "u",
        "ü": "u",
        "ǘ": "u",
        "ǚ": "u",
        "ǜ": "u",
        "ǖ": "u",
        "ṳ": "u",
        "ụ": "u",
        "ű": "u",
        "ȕ": "u",
        "ù": "u",
        "ủ": "u",
        "ư": "u",
        "ứ": "u",
        "ự": "u",
        "ừ": "u",
        "ử": "u",
        "ữ": "u",
        "ȗ": "u",
        "ū": "u",
        "ṻ": "u",
        "ų": "u",
        "ᶙ": "u",
        "ů": "u",
        "ũ": "u",
        "ṹ": "u",
        "ṵ": "u",
        "ᵫ": "ue",
        "ꝸ": "um",
        "ⱴ": "v",
        "ꝟ": "v",
        "ṿ": "v",
        "ʋ": "v",
        "ᶌ": "v",
        "ⱱ": "v",
        "ṽ": "v",
        "ꝡ": "vy",
        "ẃ": "w",
        "ŵ": "w",
        "ẅ": "w",
        "ẇ": "w",
        "ẉ": "w",
        "ẁ": "w",
        "ⱳ": "w",
        "ẘ": "w",
        "ẍ": "x",
        "ẋ": "x",
        "ᶍ": "x",
        "ý": "y",
        "ŷ": "y",
        "ÿ": "y",
        "ẏ": "y",
        "ỵ": "y",
        "ỳ": "y",
        "ƴ": "y",
        "ỷ": "y",
        "ỿ": "y",
        "ȳ": "y",
        "ẙ": "y",
        "ɏ": "y",
        "ỹ": "y",
        "ź": "z",
        "ž": "z",
        "ẑ": "z",
        "ʑ": "z",
        "ⱬ": "z",
        "ż": "z",
        "ẓ": "z",
        "ȥ": "z",
        "ẕ": "z",
        "ᵶ": "z",
        "ᶎ": "z",
        "ʐ": "z",
        "ƶ": "z",
        "ɀ": "z",
        "ﬀ": "ff",
        "ﬃ": "ffi",
        "ﬄ": "ffl",
        "ﬁ": "fi",
        "ﬂ": "fl",
        "ĳ": "ij",
        "œ": "oe",
        "ﬆ": "st",
        "ₐ": "a",
        "ₑ": "e",
        "ᵢ": "i",
        "ⱼ": "j",
        "ₒ": "o",
        "ᵣ": "r",
        "ᵤ": "u",
        "ᵥ": "v",
        "ₓ": "x"
    };
    String.prototype.latinise = function () {
        return this.replace(/[^A-Za-z0-9\[\] ]/g, function (a) {
            return Latinise.latin_map[a] || a;
        });
    };
    String.prototype.latinize = String.prototype.latinise;
    String.prototype.isLatin = function () {
        return this == this.latinise();
    };

    $(".location-mapper").bind("geocode:result", function (event, result) {

        //console.log('result', result);
        var data = {};
        $.each(result.address_components, function (index, object) {
            var name = object.types[0];
            data[name] = object.long_name;
            data[name + "_short"] = object.short_name;
        });
        //console.log('data', data);
        var county = (data.administrative_area_level_2) ? data.administrative_area_level_2.replace(/ /g, '+') : data.locality + '+County';

        county = county.latinize();
        var city = data.locality + ', ' + data.administrative_area_level_1_short;

        if (!data.locality) {
            city = county + ', ' + data.administrative_area_level_1_short;
        }

        var lat, lon;
        if (result.geometry.access_points) {
            lat = result.geometry.access_points[0].location.lat;
            lon = result.geometry.access_points[0].location.lng;
        } else {
            lat = result.geometry.location.lat();
            lon = result.geometry.location.lng();
        }

        var fips;
        // console.log('data.administrative_area_level_1_short', data.administrative_area_level_1_short);
        // console.log('COUNTY', county);
        $.each(self.fips_codes[data.administrative_area_level_1_short], function (i, c) {
            if (c.label === county.replace(/\+/g, ' ') || c.label === county.replace(/\+County/g, ' city')) {
                fips = c.fips;
                if (c.label.match('city')) {
                    county = county.replace('+County', '+City');
                }
            }
        });

        if (data.administrative_area_level_1_short === "DC") {
            fips = '11001';
        }



        //console.log('data', data, 'fips', fips);
        if (fips) {
            window.location.href = '/location/?county=' + county + '&city=' + city + '&fips=' + fips + '&lat=' + lat + '&lon=' + lon;
        }

    });

};


App.prototype.tour = function () {
    var tour;
    var self = this;

    $('.start-home-tour').on('click', function (e) {
        e.preventDefault();
        self.takeHomeTour();
    });

    $('#page-home #tour-this-page').on('click', function (e) {
        e.preventDefault();
        self.takeHomeTour();
    });

    $('#page-variables #tour-this-page').on('click', function (e) {
        e.preventDefault();
        self.takeVariablesTour();
    });

    $('.page-type-location #tour-this-page').on('click', function (e) {
        e.preventDefault();
        self.takeLocationTour();
    });

    $('.page-type-case #tour-this-page').on('click', function (e) {
        e.preventDefault();
        self.takeCaseTour();
    });

    $('#temperature-data .location-resolution a').on('click', function (e) {
        if ( $(this).parent().hasClass('disabled') ) {
          return;
        }

        $(this).parents('ul').find('a').removeClass('accent-color');
        $(this).parents('.data-options').find('li').removeClass('active').removeClass('accent-border');

        $(this).addClass('accent-color');
        $(this).parents('li').addClass('active').addClass('accent-border');

        var val = $(this).html().toLowerCase();
        self.frequency['temperature-chart'] = val;
    });

    $('#precipitation-data .location-resolution a').on('click', function (e) {
        if ( $(this).parent().hasClass('disabled') ) {
          return;
        }

        $(this).parents('ul').find('a').removeClass('accent-color');
        $(this).parents('.data-options').find('li').removeClass('active').removeClass('accent-border');

        $(this).addClass('accent-color');
        $(this).parents('li').addClass('active').addClass('accent-border');

      self.frequency['precipitation-chart'] = $(this).html().toLowerCase();
    });


    $('.how-to-read').on('click', function () {
        var pre = '';
        var closest = $(this).closest('.data-chart').attr('id');
        var mapclosest = $(this).closest('.data-map').attr('id');

        if (closest === 'precipitation-chart') {
            pre = 'precip-';
        }
        if (closest === 'derived-chart') {
            pre = 'derive-';
        }

        if (mapclosest === 'temperature-map-container'){
            pre = 'temperature-';
        }

        if (mapclosest === 'precipitation-map-container'){
            pre = 'precipitation-';
        }

        if (mapclosest === 'derived-map-container'){
            pre = 'derived-';
        }

        // console.log("WHICH ONE");
        // console.log(mapclosest);

        if (self.frequency[closest] === 'annual') {
            self.takeAnnualGraphTour(pre);
        } else if (self.frequency[closest] === 'monthly') {
            self.takeMonthlyGraphTour(pre);
        } else if (self.frequency[closest] === 'seasonal') {
            self.takeSeasonalGraphTour(pre);
        } else {
            self.takeMapTour(pre);
        }
    });



};


App.prototype.takeHomeTour = function () {
    var self = this;

    if (this.homeTour) {
        this.homeTour.cancel();
    } else {
        this.homeTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
                showCancelLink: false
            }
        });
    }

    var step1 = this.homeTour.addStep('search-by-location', {
        text: 'Enter a city, zip code, or county name to select any county in the contiguous United States.',
        attachTo: '#home-search-by-location left',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.homeTour.cancel
            },
            {
                text: 'Next',
                action: this.homeTour.next
            }
        ]
    });

    var step2 = this.homeTour.addStep('search-by-variable', {
        text: 'Explore maps or graphs of temperature, precipitation, and related variables.',
        attachTo: '#home-search-by-variable left',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.homeTour.cancel
            },
            {
                text: 'Next',
                action: this.homeTour.next
            }
        ]
    });

    this.homeTour.addStep('search-by-station', {
        text: 'View data from weather stations and tidal gauges.',
        attachTo: '#home-search-by-station left',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.homeTour.cancel
            },
            {
                text: 'Next',
                action: this.homeTour.next
            }
        ]
    });

    this.homeTour.on('show', function () {
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.homeTour.start();

};


App.prototype.takeVariablesTour = function () {
    var self = this;

    if (this.variablesTour) {
        this.variablesTour.cancel();
    } else {
        this.variablesTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }

    this.variablesTour.addStep('search-by-location', {
        text: 'Enter a location in the contiguous United States to zoom to that region.',
        attachTo: '#variable-search-by-location right',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.variablesTour.cancel
            },
            {
                text: 'Next',
                action: this.variablesTour.next
            }
        ]
    });

    this.variablesTour.addStep('variable-counties-toggle', {
        text: 'Toggle county boundaries on and off. While on, click any county to display its graph.',
        attachTo: '#variable-counties-toggle right',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.variablesTour.cancel
            },
            {
                text: 'Next',
                action: this.variablesTour.next
            }
        ]
    });

    this.variablesTour.addStep('variable-options-container', {
        text: 'Select another climate variable. Click the About... button directly below for information on each variable.',
        attachTo: '#variable-options-container right',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.variablesTour.cancel
            },
            {
                text: 'Next',
                action: this.variablesTour.next
            }
        ]
    });

    this.variablesTour.addStep('map-seasons-container', {
        text: 'For some variables, you can select different months to explore how projections for that variable differ across seasons.',
        attachTo: '#map-seasons-container bottom',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.variablesTour.cancel
            },
            {
                text: 'Next',
                action: this.variablesTour.next
            }
        ]
    });

    this.variablesTour.addStep('sliderDiv', {
        text: 'Select historical observations (30-year average from 1961-1990) or a future scenario for each side of the map, and then swipe left and right to compare conditions for the selected variable.',
        attachTo: '#sliderDiv right',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.variablesTour.cancel
            },
            {
                text: 'Next',
                action: this.variablesTour.next
            }
        ]
    });

    this.variablesTour.addStep('year-slider-container', {
        text: 'Use this slider to change the selected year you wish to view the current variable for.',
        attachTo: '#year-slider-container top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.variablesTour.cancel
            }
        ]
    });

    this.variablesTour.on('show', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.variablesTour.start();
};


App.prototype.takeLocationTour = function () {
    var self = this;

    if (this.locationTour) {
        this.locationTour.cancel();
    } else {
        this.locationTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }

    this.locationTour.addStep('location-search', {
        text: 'Switch to another county by entering a city, zip code, or county name.',
        attachTo: '#location-search bottom',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.locationTour.cancel
            },
            {
                text: 'Next',
                action: this.locationTour.next
            }
        ]
    });

    this.locationTour.addStep('page-nav', {
        text: 'Click any link to jump down the page.',
        attachTo: '#page-nav bottom',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.locationTour.cancel
            },
            {
                text: 'Next',
                action: this.locationTour.next
            }
        ]
    });

    this.locationTour.addStep('temperature-data', {
        text: 'Scroll down to see more. You can choose different variables, switch between actual values and anomalies, move the endpoints of the time slider, or view maps.',
        attachTo: '#temperature-data top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.locationTour.cancel
            },
            {
                text: 'Next',
                action: this.locationTour.next
            }
        ]
    });

    this.locationTour.addStep('moreinfo', {
        text: 'For more information about climate projections and data in Climate Explorer, check the Definitions, FAQs, and About pages.',
        attachTo: '#subnav bottom',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.locationTour.cancel
            }
        ]
    });


    this.locationTour.on('show', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.locationTour.start();
};


App.prototype.takeCaseTour = function () {
    var self = this;

    if (this.caseTour) {
        this.caseTour.cancel();
    } else {
        this.caseTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }

    this.caseTour.addStep('search-field', {
        text: 'Here you can change what location in the United States you wish to explore within the station map.',
        attachTo: '#search-by-location right',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.caseTour.cancel
            },
            {
                text: 'Next',
                action: this.caseTour.next
            }
        ]
    });

    this.caseTour.addStep('case-menu', {
        text: 'Here is the list of all available layers to show in the map. Select the "?" to view more information about each layer, as well as to toggle on and of their visibility. Lastly, click and drag to reorder the layers.',
        attachTo: '#case-menu right',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.caseTour.cancel
            }
        ]
    });

    this.caseTour.on('show', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.caseTour.start();
};


App.prototype.takeAnnualGraphTour = function (pre) {
    var self = this;

    if (this.graphTour) {
        this.graphTour.cancel();
        this.graphTour = null;
        this.graphTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    } else {
        this.graphTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }

    this.graphTour.addStep('graph', {
        text: 'For the county and variable you selected, this chart offers observed annual averages from 1950-2013; climate model simulations  (hindcasts) from 1950-2005; and climate model projections for two possible futures out to 2100.',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });

    this.graphTour.addStep('historical-obs', {
        text: 'When activated, dark gray bars show observed annual averages from 1950-2013. The horizontal line from which bars extend represents the overall average from 1961-1990. Bars that extend above the line show years that were above average. Bars that extend below the line were below average.',
        attachTo: '#' + pre + 'historical-obs top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });


    this.graphTour.addStep('historical-range', {
        text: 'The light gray band shows the range of climate model simulations (hindcasts) generated for 1950 to 2005. To get a sense of how well climate models predict this variable in this region, compare the year-to-year variability of observations (dark gray bars) with the range of values in the climate model hindcasts.',
        attachTo: '#' + pre + 'historical-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });


    this.graphTour.addStep('rcp45-range', {
        text: 'The blue band shows the range of projections for a possible future in which global emissions of heat-trapping gases peak around 2040 and then decline. This scenario is called RCP 4.5.<a href="http://asr.science.energy.gov/publications/program-docs/RCP4.5-Pathway.pdf" target="_BLANK">Learn more »</a>',
        attachTo: '#' + pre + 'rcp45-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });


    this.graphTour.addStep('rcp85-range', {
        text: 'The red band shows the range of projections for a possible future in which global emissions of heat-trapping gases continue to increase through the 21st century. This scenario is called RCP 8.5. For planning purposes, people who have a low tolerance for risk often focus on this scenario. <a href="http://link.springer.com/article/10.1007%2Fs10584-011-0148-z" target="_BLANK">Learn more »</a>',
        attachTo: '#' + pre + 'rcp85-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });

    this.graphTour.addStep('rcp45-mean', {
        text: 'Average lines show the weighted mean of all projections at each time step (projections are weighted based on model independence and skill). The lines aren’t predictions of actual values; they merely highlight trends in the projections.',
        attachTo: '#' + pre + 'rcp45-mean top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });

    this.graphTour.addStep('timeline', {
        text: 'Drag the endpoints of the time slider to zoom to specific periods. You can also click and drag the Y axis to adjust the graph display.',
        attachTo: '#' + pre + 'slider-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            },
            {
                text: 'Next',
                action: this.graphTour.next
            }
        ]
    });


    this.graphTour.addStep('moreinfo', {
        text: 'For more information about climate projections and data in Climate Explorer, check the Definitions, FAQs, and About pages.',
        attachTo: '#subnav bottom',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.graphTour.cancel
            }
        ]
    });


    this.graphTour.on('start', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.graphTour.start();
};


App.prototype.takeSeasonalGraphTour = function (pre) {
    var self = this;

    if (this.seasonalTour) {
        this.seasonalTour.cancel();
        this.seasonalTour = null;
        this.seasonalTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    } else {
        this.seasonalTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }

    this.seasonalTour.addStep('graph', {
        text: 'For the county and variable you selected, this chart shows observed seasonal averages from 1961-1990. It also shows the range of projections for each season during the early-, mid-, or late 21st century for two possible futures.The slight horizontal offset of observations and projections for each season is for visual clarity.',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.seasonalTour.cancel
            },
            {
                text: 'Next',
                action: this.seasonalTour.next
            }
        ]
    });

    this.seasonalTour.addStep('historical-obs', {
        text: 'Black lines show observed three-month averages from 1961-1990. Winter = December-February; Spring = March-May; Summer = June-August; Fall = September-November',
        attachTo: '#' + pre + 'historical-obs top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.seasonalTour.cancel
            },
            {
                text: 'Next',
                action: this.seasonalTour.next
            }
        ]
    });


    this.seasonalTour.addStep('rcp45-range', {
        text: 'The blue bars show the range of projections for each season in a possible future in which global emissions of heat-trapping gases peak around 2040 and then decline. This scenario is called RCP 4.5. <a href="http://asr.science.energy.gov/publications/program-docs/RCP4.5-Pathway.pdf" target="_BLANK">Learn more »</a>',
        attachTo: '#' + pre + 'rcp45-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.seasonalTour.cancel
            },
            {
                text: 'Next',
                action: this.seasonalTour.next
            }
        ]
    });


    this.seasonalTour.addStep('rcp85-range', {
        text: 'Red bars shows the range of projections for each season in a possible future in which global emissions of heat-trapping gases continue to increase through the 21st century. This scenario is called RCP 8.5. For planning purposes, people who have a low tolerance for risk often focus on this scenario. <a href="http://link.springer.com/article/10.1007%2Fs10584-011-0148-z" target="_BLANK">Learn more »</a>',
        attachTo: '#' + pre + 'rcp85-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.seasonalTour.cancel
            },
            {
                text: 'Next',
                action: this.seasonalTour.next
            }
        ]
    });

    this.seasonalTour.addStep('rcp45-mean', {
        text: 'Average lines show the weighted mean of all projections at each time step (projections are weighted based on model independence and skill). Viewing the lines can help highlight trends in the projections.',
        attachTo: '#' + pre + 'rcp45-mean top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.seasonalTour.cancel
            },
            {
                text: 'Next',
                action: this.seasonalTour.next
            }
        ]
    });


    this.seasonalTour.addStep('timeline', {
        text: 'Drag the endpoints of the time slider to zoom to specific periods. You can also click and drag the Y axis to adjust the graph display.',
        attachTo: '#' + pre + 'slider-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.seasonalTour.cancel
            }
        ]
    });


    this.seasonalTour.on('start', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.seasonalTour.start();
};



App.prototype.takeMonthlyGraphTour = function (pre) {
    var self = this;

    if (this.monthlyTour) {
        this.monthlyTour.cancel();
        this.monthlyTour = null;
        this.monthlyTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    } else {
        this.monthlyTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }


    this.monthlyTour.addStep('graph', {
        text: 'For the county and variable you selected, this chart shows observed averages for each month and monthly projections for two possible futures. The timeline gives you the option to view projections for the early-, mid-, or late 21st century.',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.monthlyTour.cancel
            },
            {
                text: 'Next',
                action: this.monthlyTour.next
            }
        ]
    });

    this.monthlyTour.addStep('historical-obs', {
        text: 'The black line connects observed averages in the selected region for each month from 1961-1990.',
        attachTo: '#' + pre + 'historical-obs top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.monthlyTour.cancel
            },
            {
                text: 'Next',
                action: this.monthlyTour.next
            }
        ]
    });


    this.monthlyTour.addStep('rcp45-range', {
        text: 'The blue band shows the range of projections for a possible future in which global emissions of heat-trapping gases peak around 2040 and then decline. This scenario is called RCP 4.5. <a href="http://asr.science.energy.gov/publications/program-docs/RCP4.5-Pathway.pdf" target="_BLANK">Learn more »</a>',
        attachTo: '#' + pre + 'rcp45-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.monthlyTour.cancel
            },
            {
                text: 'Next',
                action: this.monthlyTour.next
            }
        ]
    });


    this.monthlyTour.addStep('rcp85-range', {
        text: 'The red band shows the range of projections for a possible future in which global emissions of heat-trapping gases continue to increase through the 21st century. This scenario is called RCP 8.5. For planning purposes, people who have a low tolerance for risk often focus on this scenario. <a href="http://link.springer.com/article/10.1007%2Fs10584-011-0148-z" target="_BLANK">Learn more »</a>',
        attachTo: '#' + pre + 'rcp85-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.monthlyTour.cancel
            },
            {
                text: 'Next',
                action: this.monthlyTour.next
            }
        ]
    });

    this.monthlyTour.addStep('rcp45-mean', {
        text: 'Average lines show the weighted mean of all projections at each time step (projections are weighted based on model independence and skill). The lines aren’t predictions of actual values; they merely highlight trends in the projections.',
        attachTo: '#' + pre + 'rcp45-mean top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.monthlyTour.cancel
            },
            {
                text: 'Next',
                action: this.monthlyTour.next
            }
        ]
    });


    this.monthlyTour.addStep('rcp45-mean', {
        text: 'Drag the endpoints of the time slider to zoom to specific periods. You can also click and drag the Y axis to adjust the graph display.',
        attachTo: '#slider-range top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.monthlyTour.cancel
            }
        ]
    });


    this.monthlyTour.on('start', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.monthlyTour.start();
};



App.prototype.takeMapTour = function (pre) {
    var self = this;

    if (this.mapTour) {
        this.mapTour.cancel();
        this.mapTour = null;
        this.mapTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    } else {
        this.mapTour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });
    }

    this.mapTour.addStep('whole-map', {
        text: 'Colors on the map show projected average values for the selected variable for the season shown in the upper right during the decade indicated by the time slider below.',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.mapTour.cancel
            },
            {
                text: 'Next',
                action: this.mapTour.next
            }
        ]
    });

    this.mapTour.addStep('scenario-slider', {
        text: 'Select historical observations (30-year average from 1961-1990) or a future scenario for each side of the map, and then swipe left and right to compare conditions for the selected variable.',
        attachTo: '#' + pre + 'swipeImg top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.mapTour.cancel
            },
            {
                text: 'Next',
                action: this.mapTour.next
            }
        ]
    });

    this.mapTour.addStep('season-selector', {
        text: 'Select the season for the map display. Monthly projections for January, April, July, or October represent their respective seasons.',
        attachTo: '#' + pre + 'map-season top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.mapTour.cancel
            },
            {
                text: 'Next',
                action: this.mapTour.next
            }
        ]
    });



    this.mapTour.addStep('time-slider', {
        text: 'Move the time slider to display projected conditions for any decade from 1950 to 2090.',
        attachTo: '#' + pre + 'map-slider-container top',
        buttons: [
            {
                text: 'Close',
                classes: 'shepherd-button-secondary',
                action: this.mapTour.cancel
            }
        ]
    });


    this.mapTour.on('start', function () {
        //$('.cd-cover-layer').removeClass('is-visible');
        //$('.cd-cover-layer').addClass('is-visible');
        setTimeout(function () {
            //$('.cd-cover-layer').removeClass('is-visible');
        }, 4000);
    });

    this.mapTour.start();
};
