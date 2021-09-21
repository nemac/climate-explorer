// language=HTML
export default (config) => `
  <div class="share-widget">
    <a href="#" class="share-trigger"><span class="icon icon-social"></span>Share</a>
    <ul>
      <li><a href="" id="share_facebook" class="share-link share-facebook" target="_blank"><span class="icon icon-facebook"></span>Facebook</a></li>
      <li><a href="" id="share_twitter" class="share-link share-twitter" target="_blank"><span class="icon icon-twitter"></span>Twitter</a></li>
      <li id="share-permalink"><a href="#" class="share-link share-permalink"><span class="icon icon-link"></span>Copy Permalink</a></li>
    </ul>
    <div id="share-permalink-input">
      <input type="text" id="share_link" value="">
    </div>
  </div>
`
