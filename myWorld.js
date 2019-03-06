var myWorld;
(function (myWorld) {
    var Camera = (function () {
        function Camera() {
            this.Position = myMath.Vector3.Zero();
            this.Target = myMath.Vector3.Zero();
        }
        return Camera;
    })();
    myWorld.Camera = Camera;    
    var Mesh = (function () {
        function Mesh(name, verticesCount, facesCount) {
            this.name = name;
            this.Vertices = new Array(verticesCount);
            this.Faces = new Array(facesCount);
            this.Rotation = new myMath.Vector3(0, 0, 0);
            this.Position = new myMath.Vector3(0, 0, 0);
        }
        return Mesh;
    })();
    myWorld.Mesh = Mesh;  
    var Light = (function (){
        function Light(){
            this.Position = myMath.Vector3.Zero();
        }
        return Light;
    });
    myWorld.Light = Light;
    var Device = (function () {
        function Device(canvas) {
            this.workingCanvas = canvas;
            this.workingWidth = canvas.width;
            this.workingHeight = canvas.height;
            this.workingContext = this.workingCanvas.getContext("2d");
            this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
        }
        // This function is called to clear the back buffer with a specific color
        Device.prototype.clear = function () {
            // Clearing with black color by default
            this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
            // once cleared with black pixels, we're getting back the associated image data to 
            // clear out back buffer
            this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);

            // Clearing depth buffer
            for (var i = 0; i < this.depthbuffer.length; i++) {
                // Max possible value 
                this.depthbuffer[i] = 10000000;
            }
        };
        Device.prototype.present = function () {
            this.workingContext.putImageData(this.backbuffer, 0, 0);
        };
        
        // Called to put a pixel on screen at a specific X,Y coordinates
        Device.prototype.putPixel = function (x, y, z, color) {
            this.backbufferdata = this.backbuffer.data;
            // As we have a 1-D Array for our back buffer
            // we need to know the equivalent cell index in 1-D based
            // on the 2D coordinates of the screen
            var index = ((x >> 0) + (y >> 0) * this.workingWidth);
            var index4 = index * 4;

            if(this.depthbuffer[index] < z) {
                return; // Discard
            }

            this.depthbuffer[index] = z;

            // RGBA color space is used by the HTML5 canvas 
            this.backbufferdata[index4] = color.r * 255;
            this.backbufferdata[index4 + 1] = color.g * 255;
            this.backbufferdata[index4 + 2] = color.b * 255;
            this.backbufferdata[index4 + 3] = color.a * 255;
        };

        // Project takes some 3D coordinates and transform them
        // in 2D coordinates using the transformation matrix
        // It also transform the same coordinates and the normal to the vertex 
        // in the 3D world
        Device.prototype.project = function (vertex, transMat, world) {
            // Transforming the coordinates into 2D system
            var point2d = myMath.Vector3.TransformCoordinates(vertex.Coordinates, transMat);
            
            // Transforming the coordinates & normals to vertex in 3D system
            var point3DWorld = myMath.Vector3.TransformCoordinates(vertex.Coordinates, world);
            var normal3DWorld = myMath.Vector3.TransformCoordinates(vertex.Normal, world);

            // The transformed coordinates will be based on coordinate system
            // starting on the center of the screen. But drawing on screen normally starts
            // from top left. We then need to transform them again to have x:0, y:0 on top left.
            var x = point2d.x * this.workingWidth + this.workingWidth / 2.0;
            var y = -point2d.y * this.workingHeight + this.workingHeight / 2.0;
            return ({
                Coordinates: new myMath.Vector3(x, y, point2d.z),
                Normal: normal3DWorld,
                WorldCoordinates: point3DWorld
            });
        };

        Device.prototype.LoadJSONFileAsync = function (fileName, callback) {
            var jsonObject = {};
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", fileName, true);
            var that = this;
            xmlhttp.onreadystatechange = function () {
                if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    jsonObject = JSON.parse(xmlhttp.responseText);
                    console.log(jsonObject);
                    callback(that.CreateMeshesFromJSON(jsonObject));
                }
            };
            xmlhttp.send(null);
        };

        Device.prototype.CreateMeshesFromJSON = function (jsonObject) {
            var meshes = [];
            for(var meshIndex = 0; meshIndex < jsonObject.meshes.length; meshIndex++) {
                var verticesArray = jsonObject.meshes[meshIndex].vertices;
                // Faces
                var indicesArray = jsonObject.meshes[meshIndex].indices;
        
                var uvCount = jsonObject.meshes[meshIndex].uvCount;
                var verticesStep = 1;
        
                // Depending of the number of texture's coordinates per vertex
                // we're jumping in the vertices array  by 6, 8 & 10 windows frame
                switch(uvCount) {
                    case 0:
                        verticesStep = 6;
                        break;
                    case 1:
                        verticesStep = 8;
                        break;
                    case 2:
                        verticesStep = 10;
                        break;
                }
        
                // the number of interesting vertices information for us
                var verticesCount = verticesArray.length / verticesStep;
                // number of faces is logically the size of the array divided by 3 (A, B, C)
                var facesCount = indicesArray.length / 3;
                var mesh = new myWorld.Mesh(jsonObject.meshes[meshIndex].name, verticesCount, facesCount);
        
                // Filling the Vertices array of our mesh first
                for (var index = 0; index < verticesCount; index++) {
                    // Loading the vertex coordinates exported by Blender
                    var x = verticesArray[index * verticesStep];
                    var y = verticesArray[index * verticesStep + 1];
                    var z = verticesArray[index * verticesStep + 2];

                    // Loading the vertex normal exported by Blender
                    var nx = verticesArray[index * verticesStep + 3];
                    var ny = verticesArray[index * verticesStep + 4];
                    var nz = verticesArray[index * verticesStep + 5];
                    mesh.Vertices[index] = {
                        Coordinates: new myMath.Vector3(x, y, z),
                        Normal: new myMath.Vector3(nx, ny, nz),
                        WorldCoordinates: null
                    };
                }
        
                // Then filling the Faces array
                for(var index = 0; index < facesCount; index++) {
                    var a = indicesArray[index * 3];
                    var b = indicesArray[index * 3 + 1];
                    var c = indicesArray[index * 3 + 2];
                    mesh.Faces[index] = {
                        A: a,
                        B: b,
                        C: c
                    };
                }

                
                // Getting the position you've set in Blender
                var position = jsonObject.meshes[meshIndex].position;
                mesh.Position = new myMath.Vector3(position[0], position[1], position[2]);
                meshes.push(mesh);
            }
            return meshes;
        };

        Device.prototype.drawPoint = function (point,color=(1, 1, 0, 1)) {
            // Clipping what's visible on screen
            if(point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
                this.putPixel(point.x, point.y, point.z, color);
            }
        };

        // Clamping values to keep them between 0 and 1
        Device.prototype.clamp = function (value, min, max) {
            if (typeof min === "undefined") { min = 0; }
            if (typeof max === "undefined") { max = 1; }
            return Math.max(min, Math.min(value, max));
        };

        // Interpolating the value between 2 vertices 
        // min is the starting point, max the ending point
        // and gradient the % between the 2 points
        Device.prototype.interpolate = function (min, max, gradient) {
            return min + (max - min) * this.clamp(gradient);
        };

       // drawing line between 2 points from left to right
        // papb -> pcpd
        // pa, pb, pc, pd must then be sorted before
        Device.prototype.processScanLine = function (data, va, vb, vc, vd, color) {
            var pa = va.Coordinates;
            var pb = vb.Coordinates;
            var pc = vc.Coordinates;
            var pd = vd.Coordinates;

            // Thanks to current Y, we can compute the gradient to compute others values like
            // the starting X (sx) and ending X (ex) to draw between
            // if pa.Y == pb.Y or pc.Y == pd.Y, gradient is forced to 1
            var gradient1 = pa.y != pb.y ? (data.currentY - pa.y) / (pb.y - pa.y) : 1;
            var gradient2 = pc.y != pd.y ? (data.currentY - pc.y) / (pd.y - pc.y) : 1;

            var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
            var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;

            // starting Z & ending Z
            var z1 = this.interpolate(pa.z, pb.z, gradient1);
            var z2 = this.interpolate(pc.z, pd.z, gradient2);

            var snl = this.interpolate(data.ndotla, data.ndotlb, gradient1);
            var enl = this.interpolate(data.ndotlc, data.ndotld, gradient2);

            // drawing a line from left (sx) to right (ex) 
            for (var x = sx; x < ex; x++) {
                var gradient = (x - sx) / (ex - sx);

                var z = this.interpolate(z1, z2, gradient);
                var ndotl = this.interpolate(snl, enl, gradient);
                // changing the color value using the cosine of the angle
                // between the light vector and the normal vector
                this.drawPoint(new myMath.Vector3(x, data.currentY, z), 
                            new myMath.Color4(color.r * ndotl, color.g * ndotl, color.b * ndotl, 1));
            }
        };

        // Compute the cosine of the angle between the light vector and the normal vector
        // Returns a value between 0 and 1
        Device.prototype.computeNDotL = function (vertex, normal, lightPosition) {
            var lightDirection = lightPosition.subtract(vertex);

            normal.normalize();
            lightDirection.normalize();

            return Math.max(0, myMath.Vector3.Dot(normal, lightDirection));
        };

        Device.prototype.drawTriangle = function (v1, v2, v3, color,lightPosition) {
            // Sorting the points in order to always have this order on screen p1, p2 & p3
            // with p1 always up (thus having the Y the lowest possible to be near the top screen)
            // then p2 between p1 & p3
            if (v1.Coordinates.y > v2.Coordinates.y) {
                var temp = v2;
                v2 = v1;
                v1 = temp;
            }
        
            if (v2.Coordinates.y > v3.Coordinates.y) {
                var temp = v2;
                v2 = v3;
                v3 = temp;
            }
        
            if (v1.Coordinates.y > v2.Coordinates.y) {
                var temp = v2;
                v2 = v1;
                v1 = temp;
            }
        
            var p1 = v1.Coordinates;
            var p2 = v2.Coordinates;
            var p3 = v3.Coordinates;
        
            // // Light position
            // var lightPos = new myMath.Vector3(0, 10, 10);
            // computing the cos of the angle between the light vector and the normal vector
            // it will return a value between 0 and 1 that will be used as the intensity of the color
            var nl1 = this.computeNDotL(v1.WorldCoordinates, v1.Normal, lightPosition);
            var nl2 = this.computeNDotL(v2.WorldCoordinates, v2.Normal, lightPosition);
            var nl3 = this.computeNDotL(v3.WorldCoordinates, v3.Normal, lightPosition);
        
            var data = {};
        
            // computing lines' directions
            var dP1P2;
            var dP1P3;
        
            // http://en.wikipedia.org/wiki/Slope
            // Computing slopes
            if (p2.y - p1.y > 0)
                dP1P2 = (p2.x - p1.x) / (p2.y - p1.y); else
                dP1P2 = 0;
        
            if (p3.y - p1.y > 0)
                dP1P3 = (p3.x - p1.x) / (p3.y - p1.y); else
                dP1P3 = 0;
        
            if (dP1P2 > dP1P3) {
                for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                    data.currentY = y;
        
                    if (y < p2.y) {
                        data.ndotla = nl1;
                        data.ndotlb = nl3;
                        data.ndotlc = nl1;
                        data.ndotld = nl2;
                        this.processScanLine(data, v1, v3, v1, v2, color);
                    } else {
                        data.ndotla = nl1;
                        data.ndotlb = nl3;
                        data.ndotlc = nl2;
                        data.ndotld = nl3;
                        this.processScanLine(data, v1, v3, v2, v3, color);
                    }
                }
            }
            else {
                for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                    data.currentY = y;
        
                    if (y < p2.y) {
                        data.ndotla = nl1;
                        data.ndotlb = nl2;
                        data.ndotlc = nl1;
                        data.ndotld = nl3;
                        this.processScanLine(data, v1, v2, v1, v3, color);
                    } else {
                        data.ndotla = nl2;
                        data.ndotlb = nl3;
                        data.ndotlc = nl1;
                        data.ndotld = nl3;
                        this.processScanLine(data, v2, v3, v1, v3, color);
                    }
                }
            }
        };

        Device.prototype.render = function (camera, meshes, light) {
            var viewMatrix = myMath.Matrix.LookAtLH(camera.Position, camera.Target, myMath.Vector3.Up());
            var projectionMatrix = myMath.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
            for(var index = 0; index < meshes.length; index++) {
                var cMesh = meshes[index];
                var worldMatrix = myMath.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(myMath.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
                var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
            
                for(var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++){
                    var currentFace = cMesh.Faces[indexFaces];
                    var vertexA = cMesh.Vertices[currentFace.A];
                    var vertexB = cMesh.Vertices[currentFace.B];
                    var vertexC = cMesh.Vertices[currentFace.C];

                    var pixelA = this.project(vertexA, transformMatrix, worldMatrix);
                    var pixelB = this.project(vertexB, transformMatrix, worldMatrix);
                    var pixelC = this.project(vertexC, transformMatrix, worldMatrix);

                    //getting color that changes with the variation in distance between the object(mesh) and the light position
                    var distance = myMath.Vector3.Distance(cMesh.Position,light.Position);
                    var r = 1/(distance);
                    var g = 0.8/(distance);
                    var b = 0.7/(distance);
                    document.getElementById("lightInfo").innerHTML = "Light Position : ("+Math.floor(light.Position.x*10)/10+","+
                                                                                          Math.floor(light.Position.z*10)/10+","+
                                                                                          Math.floor(light.Position.z*10)/10+")";                                                                                       
                    document.getElementById("distanceInfo").innerHTML="Distance Between Light and Ant : "+Math.floor(distance*100)/100;
                    
                    this.drawTriangle(pixelA, pixelB, pixelC, new myMath.Color4(r, g, b, 1), light.Position);
                }
            }
        };
        return Device;
    })();
    myWorld.Device = Device;    
})(myWorld || (myWorld = {}));
