import React, { Component, Fragment } from 'react';
import { Icon, Slider } from 'antd';
import 'antd/dist/antd.css';

import * as THREE from 'three';
import * as TrackballControls from 'three-trackballcontrols';
const STLLoader = require('three-stl-loader')(THREE);

Number.prototype.pad = function(size) {
  let s = String(this);
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

export default class Viewer extends Component {
  fileIndices = [1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  constructor(props) {
    super(props);

    this.gums = [];
    this.teethes = [];
  }

  componentDidMount() {
    this.glRenderer = new THREE.WebGLRenderer({ canvas: this.refs.painter });
    this.glRenderer.animate(() => this.onAnimate());

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, this.props.width / this.props.height, 1, 5000);
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    this.light = new THREE.DirectionalLight(0xffffff, 1);
    // this.light.color.setHSL(0.1, 1, 0.95);
    this.light.position.set(0, 0, 100);
    this.scene.add(this.light);

    this.controls = new TrackballControls(this.camera, this.refs.painter);

    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;

    this.controls.noZoom = false;
    this.controls.noPan = false;

    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    this.controls.keys = [ 65, 83, 68 ];

    this.controls.addEventListener('change', () => {
      this.light.position.copy(this.camera.position);
    });

    this.startAutoRotation();

    for (let i = 0; i < this.fileIndices.length; i++) {
      const index = this.fileIndices[i].pad(3);
      const gumloader = new STLLoader();
      gumloader.load(`./res/F1XA${index}_gs.stl`, geometry => {
        const material = new THREE.MeshLambertMaterial({ color: 0xffc1cc });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-Math.PI / 2);
        mesh.rotateZ(Math.PI);
        if (i !== 0)
          mesh.visible = false;
        this.gums[i] = mesh;
        this.scene.add(mesh);
      });
      const teethLoader = new STLLoader();
      teethLoader.load(`./res/F1XA${index}_teeth.stl`, geometry => {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-Math.PI / 2);
        mesh.rotateZ(Math.PI);
        if (i !== 0)
          mesh.visible = false;
        this.teethes[i] = mesh;
        this.scene.add(mesh);
      });
    }

    this.kernelAngle = 0;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
      this.camera.aspect = nextProps.width / nextProps.height;
      this.camera.updateProjectionMatrix();
      this.glRenderer.setSize(nextProps.width, nextProps.height);
    }
  }

  startAutoRotation() {
    this.timerId = window.setInterval(() => {
      // switch (this.props.kernelRotationDir) {
      //   case 'clockwise':
      //     this.kernelAngle = (this.kernelAngle + 4) % 360;
      //     this.updateBlades(this.props);
      //     break;
      //   case 'counter-clockwise':
      //     this.kernelAngle = (this.kernelAngle - 4) % 360;
      //     this.updateBlades(this.props);
      //     break;
      //   default:
      //     break;
      // }
    }, 60);
  }

  stopAutoRotation() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }

  onAnimate() {
    // we will get this callback every frame

    // pretend cubeRotation is immutable.
    // this helps with updates and pure rendering.
    // React will be sure that the rotation has now updated.
    // this.setState({
    //   cubeRotation: new THREE.Euler(
    //     this.props.cubeRotation.x + 0.1,
    //     this.props.cubeRotation.y + 0.1,
    //     0
    //   )
    // });
    this.controls.update();

    this.glRenderer.render(this.scene, this.camera);
  }

  handleSliding = (stage) => {
    for (let i = 0; i < this.fileIndices.length; i++) {
      if (this.gums[i]) {
        this.gums[i].visible = i === stage;
      }
      if (this.teethes[i]) {
        this.teethes[i].visible = i === stage;
      }
    }
  }

  onBack = () => {}

  onForward = () => {}

  render() {
    let marks = {};
    for (let i = 0; i < this.fileIndices.length; i++) {
      marks[i] = (i + 1).toString(10);
    }
    console.log('marks', marks);
    return (
      <Fragment>
        <canvas ref="painter" width={this.props.width} height={this.props.height} style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }} />
        <div style={{
          position: 'absolute',
          right: '10%',
          bottom: '10%',
          left: '10%',
          display: 'flex',
          flexDirection: 'row'
        }}>
          <div style={{ marginRight: 50 }}>
            <Icon type="arrow-left" style={{ color: 'white', fontSize: 36 }} onClick={this.onBack} />
            <Icon type="caret-right" style={{ color: 'white', fontSize: 48 }} />
            <Icon type="arrow-right" style={{ color: 'white', fontSize: 36 }} onClick={this.onForward} />
          </div>
          <Slider
            min={0}
            max={this.fileIndices.length - 1}
            marks={marks}
            defaultValue={0}
            style={{ flex: 1, color: 'white' }}
            onChange={this.handleSliding}
          />
        </div>
      </Fragment>
    );
  }
}
