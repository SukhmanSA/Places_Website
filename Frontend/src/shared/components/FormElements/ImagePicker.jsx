import { useEffect, useRef, useState } from "react";
import Button from "./Buttons";
import "./ImageUpload.css";

export default function ImagePicker({ id, center, onInput, errorText }) {

  const [file,setFile] = useState('')
  const [previewUrl,setPreviewUrl] = useState('')
  const [isValid,setIsValid] = useState(false)

    const imageRef = useRef("")

    const pickedImageHandler = (e) => {
      let pickedFile;
      let fileIsValid = isValid;
        if( e.target.files &&  e.target.files.length === 1 ){
            pickedFile = e.target.files[0]
            setFile(pickedFile)
            setIsValid(true)
            fileIsValid = true
        }else{
          setIsValid(false)
          fileIsValid = false
        }

        onInput( id, pickedFile, fileIsValid )
    }

    useEffect(()=>{
      if(!file){
        return
      }
      const fileReader = new FileReader()
      fileReader.onload=()=>{
        setPreviewUrl(fileReader.result)
      }
      fileReader.readAsDataURL(file)
    },[file])

    const pickImageHandler = () => {
        imageRef.current.click()
    }

  return (
    <div className="form-control">
      <input
        id={id}
        type="file"
        style={{ display: "none" }}
        accept=".png,.jpg,.jpeg"
        ref={imageRef}
        onChange={pickedImageHandler}
      />
      <div className={`image-upload ${ center && "center" }`}>
        <div className="image-upload__preview">
            { previewUrl && <img src={previewUrl} alt="Preview"/>}
            { !previewUrl && <p>Please select an Image</p> }
        </div>
        <Button type="button" onClick={pickImageHandler}>Pick an Image</Button>
      </div>
    </div>
  );
}
