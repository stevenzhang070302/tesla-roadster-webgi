import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    BloomPlugin,
    GammaCorrectionPlugin,
    Vector3,
    MeshBasicMaterial2,
    Color,
    AssetImporter,
    DiamondPlugin,
    FrameFadePlugin,
    GLTFAnimationPlugin,
    GroundPlugin,
    TemporalAAPlugin,
    AnisotropyPlugin,
    addBasePlugins,
    CanvasSnipperPlugin,
    mobileAndTabletCheck
} from "webgi";
import "./styles.css";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

async function setupViewer(){

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
        useRgbm: false, // Use RGBM encoding!!
    })

    const isMobile = mobileAndTabletCheck()
    console.log(isMobile)

    // Add plugins individually.
    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target

    const exitButton = document.querySelector('.button-exit') as HTMLElement
    const customizerInterface = document.querySelector('.customizer-container') as HTMLElement
    
    // await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(!viewer.useRgbm))
    await viewer.addPlugin(GammaCorrectionPlugin)
    await viewer.addPlugin(SSRPlugin)
    await viewer.addPlugin(SSAOPlugin)
    // await viewer.addPlugin(BloomPlugin)
    // await viewer.addPlugin(DiamondPlugin)
    // await viewer.addPlugin(FrameFadePlugin)
    // await viewer.addPlugin(GLTFAnimationPlugin)
    // await viewer.addPlugin(GroundPlugin)
    // await viewer.addPlugin(TemporalAAPlugin)
    // await viewer.addPlugin(AnisotropyPlugin)
    // await addBasePlugins(viewer)

    // Loader
    const importer = manager.importer as AssetImporter
    importer.addEventListener('onProgress', (event) => {
        const progressRatio = (event.loaded / event.total)
        console.log(`Progress: ${progressRatio}`)
    })

    importer.addEventListener('onLoad', (event) => {
        gsap.to('.loader', {y: '-100%', duration: 0.8, ease: 'power2.inOut', delay: 1, onComplete: () => {
            document.body.style.overflowY = 'auto'
        }})
    })

    viewer.renderer.refreshPipeline()
    

    await manager.addFromPath("./assets/tesla.glb")
    

    const paint = manager.materials?.findMaterialsByName('car_main_paint')[0] as MeshBasicMaterial2
    console.log(paint)

    viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true
    
    viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
    window.scrollTo(0,0)
    // onUpdate()

    // position.set(-5.26, 0.38, 5.61)

    if (isMobile){
        position.set(1.68, 0.71, 7.49)
        target.set(-1.20, -0.01, 0.45)
    } else {
        position.set(1.68, 0.71, 7.49)
        target.set(-1.20, -0.01, 0.45)
    }

    function setupScrollAnimation() {
        const tl = gsap.timeline()
    
        // First section
        tl.to(position, {x: -2.03, y: 1.36, z: 4.23,
            scrollTrigger: {
                trigger: ".second",
                start: "top bottom",
                end: "top top",
                scrub: true,
                immediateRender: false,
            }
            , onUpdate})
            .to(".section-one-container",
                {xPercent: '150',
                opacity: 0,
                scrollTrigger: {
                    trigger: ".second",
                    start: "top bottom",
                    end: "top 80%",
                    scrub: 1,
                    immediateRender: false,
                }})
            .to(target, {x: 0.11, y: 0.22, z: 1.5,
                scrollTrigger: {
                    trigger: ".second",
                    start: "top bottom",
                    end: "top top",
                    scrub: true,
                    immediateRender: false,
                }})
        // Last section
            .to(position, {x: 1.69, y: 1.99, z: 6.16,
                scrollTrigger: {
                    trigger: ".third",
                    start: "top bottom",
                    end: "top top",
                    scrub: true,
                    immediateRender: false,
                }
                , onUpdate})
            .to(".section-two-text",
                {xPercent: '-150',
                opacity: 0,
                scrollTrigger: {
                    trigger: ".third",
                    start: "top bottom",
                    end: "top 80%",
                    scrub: 1,
                    immediateRender: false,
                }})
            .to(target, {x: -0.70, y: -0.42, z: 0.80,
                scrollTrigger: {
                    trigger: ".third",
                    start: "top bottom",
                    end: "top top",
                    scrub: true,
                    immediateRender: false,
                }})
    }

    setupScrollAnimation()

    // WEBGL Update
    let needsUpdate = true
    function onUpdate() {
        needsUpdate = true
        viewer.renderer.resetShadows()
    }

    viewer.addEventListener('preFrame', () => {
        if(needsUpdate){
            camera.positionUpdated(false)
            camera.targetUpdated(true)
            needsUpdate = false
        }
    })

    // KNOW MORE
    document.querySelector('.button-hero')?.addEventListener('click', () => {
        const element = document.querySelector('.second')
        window.scrollTo({top: element?.getBoundingClientRect().top, left:0, behavior: 'smooth'})
    })

    // SCROLL TO TOP
    document.querySelector('.button-footer')?.addEventListener('click', () => {
        window.scrollTo({top: 0, left:0, behavior: 'smooth'})
    })

    // Customize
    const sections = document.querySelector('.container') as HTMLElement
    const mainContainer = document.getElementById('webgi-canvas-container') as HTMLElement
    document.querySelector('.button-customize')?.addEventListener('click', () => {
        sections.style.visibility = 'hidden'
        mainContainer.style.pointerEvents = 'all'
        document.body.style.cursor = 'grab'
        gsap.to(position, {x: 3.95, y: 1.34, z: 4.82, duration: 2, ease: 'power2.inOut', onUpdate})
        gsap.to(target, {x: -0.15, y: -0.26, z: 0.24, duration: 2, ease: 'power2.inOut', onUpdate, onComplete: enableControllers})
    })

    function enableControllers(){
        exitButton.style.visibility = 'visible'
        customizerInterface.style.visibility = 'visible'
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})
    }

    // EXIT Customizer
    exitButton.addEventListener('click', () => {
        gsap.to(position, {x: 1.69, y: 1.99, z: 6.16, duration: 1, ease: 'power2.inOut', onUpdate})
        gsap.to(target, {x: -0.70, y: -0.42, z: 0.80, duration: 1, ease: 'power2.inOut', onUpdate})
        exitButton.style.visibility = 'hidden'
        customizerInterface.style.visibility = 'hidden'
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
        sections.style.visibility = 'visible'
        mainContainer.style.pointerEvents = 'none'
        document.body.style.cursor = 'default'
    })

    document.querySelector('.button-colors.white')?.addEventListener('click', () => {
        changeColor(new Color(0xffffff).convertSRGBToLinear())
    })

    document.querySelector('.button-colors.black')?.addEventListener('click', () => {
        changeColor(new Color(0x22305b).convertSRGBToLinear())
    })

    document.querySelector('.button-colors.pink')?.addEventListener('click', () => {
        changeColor(new Color(0xfea6b4).convertSRGBToLinear())
    })

    function changeColor(_colorToBeChanged: Color){
        paint.color = _colorToBeChanged
        viewer.scene.setDirty()
    }

}

setupViewer()
