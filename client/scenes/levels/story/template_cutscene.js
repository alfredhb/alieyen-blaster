import HelpButton from "../../../gameobjects/help_button";
import QuitButton from "../../../gameobjects/quit_button";

/**
 * Responsible for loading the provided video URL stored in GCS onto the canvas
 * and playing it with proper volume. If load times out, then skip to next scene
 * otherwise play video and on completion, continue (after cleaning up)
 */
export default class TemplateCutscene extends Phaser.Scene {
    constructor() {
        super('templateCutscene');
    }

    /**
     * This scene was transitioned to by either level_factory or template_level
     * [(open) ? level_factory : template_level]. url defines the video to play.
     * @param {{
     *      url: string,
     *      open: boolean,
     *      scene: Phaser.Scene
     * }} data 
     */
    init(data) {
        this.videoURL = data.url;
        this.nextScene = (typeof(data.open) == "string") ? data.open : (data.open) ? "levelFactory" : "templateLevelScene";
        this.levelData = data.scene;
    }

    /**
     * Create a document element with src as url and attach to scene to play
     * automatically
     */
    create() {
        const { width, height } = this.scale;

        const loadText = this.add.text(
            width * 0.5, 
            height * 0.5, 
            'Loading...',
            {
                fontSize: (height * 0.11) + "px",
                fontFamily: "impact-custom",
                align: "center",
            }
        );
        loadText.setOrigin(0.5);

        this.addVideo(width, height);

        this.quit = new QuitButton(this, {
            backMenu: this.levelData, 
            cutscene: true,
            execFunc: () => {
                this.video.pause();
                this.videoElt.remove(); // kill iframe
            }
        });

        this.help = new HelpButton(this, {
            execFunc: () => {
                this.video.pause();

                this.videoElt.style.zIndex = "-1";
                this.events.addListener('resume', () => {
                    this.events.removeListener('resume');
                    this.videoElt.style.zIndex = "10";
                    this.video.play();
                });
            }
        });
    }

    addVideo(width, height) {
        // create video
        this.video = document.createElement('video');
        this.video.playsInline = true;
        this.video.src = this.videoURL;
        this.video.width = width;
        this.video.height = height * 0.75;
        this.video.autoplay = true;
        
        // add to dom
        this.videoElt = document.body.appendChild(this.video);
        this.videoElt.classList.add('cutscene');

        // Listen for video end and transition back
        this.video.addEventListener('ended', (e) => {
            this.videoElt.remove(); // kill iframe

            //Transition out of scene
            setTimeout(() => {
                this.scene.resume(this.levelData, { cutscene: true });
                this.scene.stop();
            }, 500); // wait 1 sec before transition
        });
    }
}