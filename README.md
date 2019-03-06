# Graphics-Project---The-Ant-Model
Implementation of algorithms learned from the computer graphics subject to build an object from scratch and give the lighting and shading effects.

This project uses the "BABYLON.js" to for the mathematics part involved which is renamed to "mathLogic.js" and the main implementation of the computer graphics algorithm is in the "myWorld.js" file. The "main.js" is where you refer to your ".babylon" file.

#How to get things ready
#Blender Part
The "io_export_babylon.zip" file has the code to export the babylon file from the blender so this needs to be added to blender to be able to get the ".babylon" format file. There is no need to extract the ".zip" file.
  The instruction is for Blender v2.79:
    1.  Open Blender
    2.  Goto File->User Preferences->Add-ons->Install Add-on from File
    3.  Browse and select the "io_export_babylon.zip" file and click on "Install Add-on from File"
    4.  Now search for babylon in the search box and tick the babylon related unticked options.
    5.  Now your blender is ready to export the .babylon files and hence you can model your object in blender and goto "File"           and hovering over "Export" shows you "Babylon.js(.babylon)". Selecting this will provide you the .babylon file in your         prefered directory.

Now that you got your .babylon file ready. Follow the steps below for rendering in the browser:
    1.  In the "main.js" line 17, change the name of the file to your model which is by default refering to bullet-ant.babylon,         my current model. Don't forget to save the file.
    2.  Open the terminal and 'cd' to the root of this directory. In general, the directory containing the "index.html" and             "run.sh" file.
    3.  Use the command "./run.sh" to run the server in localhost and using the port browse the location to get your model seen         in the canvas of html file.
    #alternative for step 2: you can run server even from anyone of the command according to your python version:
        If python2 => use command : python -m SimpleHTTPServer 0
        If python3 => use command : python -m http.server 0
        Note: Here `0` refer to port address to be randomly allocated, you can change it to any free port address of your                     choice to run the server on.
