import { useLayoutEffect, useRef, useState } from 'react';
import { RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { Button, Colors, Snackbar, Subheading, TextInput } from 'react-native-paper';
import axios from 'axios';

export default function EditorScreen ({ route, navigation }) {
  const editor = useRef();
  const [title, setTitle] = useState(route.params && route.params.project ? route.params.project.attributes.title : '');
  const [body, setBody] = useState(route.params && route.params.project ? route.params.project.attributes.body : '');
  const [error, setError] = useState('')

  function saveProject () {
    editor.current.blurContentEditor(); //lose focus for editor and close keyboard
    Keyboard.dismiss();
    const trimmedTitle = title.trim(),
      trimmedBody = body.trim();
    if (!trimmedTitle.length || !trimmedBody.length) {
      setError('Please fill both title and body');
      return;
    }
    axios({
      method: route.params && route.params.project ? 'PUT' : 'POST',
      url: 'http://localhost:1337/api/projects' + (route.params && route.params.project ? '/' + route.params.project.id : ''),
      data: {
        data: {
          title,
          body,
          date: Date.now()
        }
      }
    }).then(() => {
      //redirect back to home screen
      navigation.goBack();
    })
    .catch((e) => {
      console.error(e);
      setError('An error occurred, please try again later')
    })
  }

  function deleteProject () {
    console.log("route.params.project.id", route.params.project.id);
    axios.delete('http://localhost:1337/api/projects/' + route.params.project.id)
      .then(() => {
        //redirect back to home screen
      navigation.goBack();
      })
      .catch((e) => {
        console.error(e);
        setError('An error occurred, please try again later.');
      })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: body.length === 0 ? 'New Project' : 'Edit Project',
      headerRight: route.params && route.params.project ? () => (
        <Button color={Colors.redA100} onPress={deleteProject}>Delete</Button>
      ) : () => (<></>)
    });
  }, []);

  return (
    <View style={{margin: 10, flex: 1, justifyContent: 'space-between'}}>
      <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" />
      <Subheading>Content</Subheading>
      <RichToolbar
        editor={editor}
      />
      <ScrollView keyboardDismissMode='onDrag'>
        <KeyboardAvoidingView behavior={"position"}	style={{ flex: 1 }} keyboardVerticalOffset={250}>
          <RichEditor 
            style={{ flex: 1}}
            ref={editor} 
            onChange={setBody} 
            initialContentHTML={body} 
            placeholder='Start typing...'
            useContainer />
          <Button onPress={saveProject} mode="contained" style={{marginTop: 20}}>
            Save
          </Button>
        </KeyboardAvoidingView>
      </ScrollView>
      <Snackbar visible={error.length > 0} onDismiss={() => setError('')}>{error}</Snackbar>
    </View>
  )
}