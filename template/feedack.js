// language=HTML
export default (config) => `

  <!-- BEGIN HEADER TEMPLATE -->
  <a href="https://docs.google.com/forms/d/e/1FAIpQLSfeQX45XLQwrvT71U8b5pinjxSxaUZSoP-gWyIaUEjxbDQnBA/viewform?gxids=7628" id="feedback-link"
     class="feedback-link d-none" target="_blank">
    survey.
  </a>
  <div id="feedback-trigger-small" class="feedback-trigger-small d-none">
    <i class="fas fa-comment-alt feedback-icon"></i>
  </div>
  <div id="feedback-trigger" class="feedback-trigger rounded-box-bottom-left rounded-box-bottom-right d-none">
    <i class="fas fa-comment-alt feedback-icon"></i>
    <span id="feedback-text" class="feedback-text">Want to provide feedback?</span>
    <span id="feedback-close-button-yes" class="">Yes</span><span id="feedback-close-button-no" class="">No</span>
  </div>
  <!-- <div id="feedback-wrapper" class="feedback-wrapper d-none">
    <span class="helper"></span>
    <div class="feedback-holder">
      <div id="popup-close-button" class="popup-close-button">X</div>
      <div class="feedback-wrapper-text" >
        We've updated the Climate Explorer interface and are seeking feedback. If you have 15 minutes, please take this brief
        <a href="https://forms.gle/ckU9SXCH1J5GStRLA" id="feedbacklink" class="feedbacklink" target="_blank">
          survey.
        </a>
        <br /><br />
        Thanks in advance!
      </div>
    </div>
  </div> -->
  <!-- END HEADER TEMPLATE -->
`
