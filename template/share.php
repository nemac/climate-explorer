<?php
$share_title = isset($share_data['title']) ? $purifier->purify($share_data['title']) : 'Climate Explorer';
$share_url = isset($share_data['url']) ? $purifier->purify($share_data['url']) : '/';
$tweet_text = $share_title . ' via @NOAA Climate Explorer: ' . $share_url;
?>

<div class="share-widget">
  <a href="#" class="share-trigger"><span class="icon icon-social"></span>Share</a>
  <ul>
    <li><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($share_url); ?>"  data-href="<?php echo $share_url; ?>" id="share_facebook" class="share-link share-facebook"><span class="icon icon-facebook"></span>Facebook</a></li>
    <li><a href="https://twitter.com/intent/tweet?text=<?php echo urlencode($tweet_text); ?>" id="share_twitter" class="share-link share-twitter"><span class="icon icon-twitter"></span>Twitter</a></li>
    <li id="share-permalink"><a href="#" class="share-link share-permalink"><span class="icon icon-link"></span>Copy Permalink</a></li>
    <!--<li><a href="#" class="share-link share-linkedin"><span class="icon icon-linkedin"></span>LinkedIn</a></li>-->
  </ul>
  
  <div id="share-permalink-input">
    <input type="text" id="share_link" value="<?php echo $_SERVER["REQUEST_URI"] ?>">
  </div>
</div>
