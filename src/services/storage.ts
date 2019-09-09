declare var firebase: any;

const db = firebase.firestore();

export async function addNewUser(name: string, id: number) {
  try {
    console.log('here');
    await db.collection("users").doc(id).set({
      name: name,
      id: id
    });
  }
  catch (err) {
    console.error(err);
  }
}

export async function addNewWalks(walks: any[], id: number) {
  console.log(firebase.auth().currentUser);

  try {
    console.log('here');
    await db.collection("walks").doc(id).set({
      walks: walks,
      id: id
    }, { merge: true });
  }
  catch (err) {
    console.error(err);
  }
}

export async function getAllWalks(id: number) {
  try {
    const doc = await db.collection("walks").doc(id).get();

    if (doc.exists) {
      console.log("Document data:", doc.data());
      return doc.data().walks;
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
  catch (err) {
    console.error(err);
  }
}