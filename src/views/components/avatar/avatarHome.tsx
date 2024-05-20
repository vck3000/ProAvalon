import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export function AvatarHomeUi() {
  const [currentResImgLink, setCurrentResImgLink] = useState(
    '../../avatars/base-res.svg',
  );
  const [currentSpyImgLink, setCurrentSpyImgLink] = useState(
    '../../avatars/base-spy.svg',
  );
  const [avatarLibrary, setAvatarLibrary] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [selectedAvatarResLink, setSelectedAvatarResLink] = useState(null);
  const [selectedAvatarSpyLink, setSelectedAvatarSpyLink] = useState(null);

  useEffect(() => {
    // TODO-kev: Figure out why this runs 8 times
    async function fetchUserAvatarInfo() {
      // TODO-kev: Remove hardcoded username
      const response = await fetch('/profile/1/avatar/avatarinfo');
      const data = await response.json();

      // TODO-kev: Remove the loading for this?
      if (data.currentResLink) {
        setCurrentResImgLink(data.currentResLink);
      }
      if (data.currentSpyLink) {
        setCurrentSpyImgLink(data.currentSpyLink);
      }

      setAvatarLibrary(data.avatarLibrary);
    }

    // TODO-kev: What to add for .then() or .catch()? valid json issue
    fetchUserAvatarInfo();
  }, []);

  const changeAvatarRequest = () => {
    Swal.fire({
      title: 'Sending request',
      didOpen: async () => {
        Swal.showLoading();
        const response = await fetch('/profile/1/avatar/changeavatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatarId: selectedAvatarId,
            resLink: selectedAvatarResLink,
            spyLink: selectedAvatarSpyLink,
          }),
        });

        if (response.status === 200) {
          Swal.close();
          setCurrentResImgLink(selectedAvatarResLink);
          setCurrentSpyImgLink(selectedAvatarSpyLink);
          Swal.fire({ title: await response.text(), icon: 'success' });
        } else {
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'error' });
        }
      },
    });
  };

  const handleChangeAvatarRadio = (
    avatarSetId: number,
    resLink: string,
    spyLink: string,
  ) => {
    setSelectedAvatarId(avatarSetId);
    setSelectedAvatarResLink(resLink);
    setSelectedAvatarSpyLink(spyLink);
  };

  return (
    <div>
      <h1>
        <u>Avatar Home</u>
      </h1>
      <br />
      <h3>Current Avatar Set:</h3>
      <h4>
        This is your current avatar. You may submit a custom avatar request by
        clicking the button below.
      </h4>
      <div className="avatarSet" id="currentAvatarSetDiv">
        <img
          alt="Current Resistance Avatar"
          className="avatarImg"
          src={currentResImgLink}
        ></img>
        <img
          alt="Current Spy Avatar"
          className="avatarImg"
          src={currentSpyImgLink}
        ></img>
      </div>
      {/*TODO-kev: Edit the below hardcoded username*/}
      <a className="btn btn-info" href="/profile/1/customavatar">
        Submit a custom Avatar
      </a>
      <hr
        style={{
          borderColor: 'lightgrey',
          borderStyle: 'solid',
          margin: '2em',
        }}
      />
      <h3>Avatar Library*: </h3>
      <h4>
        Here are all your approved avatar sets. You can change between avatar
        sets here.
      </h4>
      <br />

      <div id="approvedAvatars" className="scrollableWindow alignCenter">
        {avatarLibrary.length === 0 ? (
          <p>Your avatar library is currently empty.</p>
        ) : (
          avatarLibrary.map((avatarSet) => (
            <div key={avatarSet.avatarSetId} className="avatarSet">
              <input
                type="radio"
                name="avatarLibrarySet"
                value={avatarSet.avatarSetId}
                onChange={() =>
                  handleChangeAvatarRadio(
                    avatarSet.avatarSetId,
                    avatarSet.resLink,
                    avatarSet.spyLink,
                  )
                }
              />
              <img
                src={avatarSet.resLink}
                alt={`Resistance avatar ${avatarSet.avatarSetId}`}
                className="avatarImg"
              />
              <img
                src={avatarSet.spyLink}
                alt={`Spy avatar ${avatarSet.avatarSetId}`}
                className="avatarImg"
              />
            </div>
          ))
        )}
      </div>
      <br />

      <a
        className="btn btn-info"
        id="changeAvatarBtn"
        onClick={() => changeAvatarRequest()}
      >
        Change avatar
      </a>

      <h4>*This feature is available to current Patreon supporters.</h4>
      <h4>
        To link your Patreon account or if you would like to support the
        development of the site please do so from your profile page{' '}
        {/*TODO-kev: Edit the hardcoded link down below*/}
        <a href="/profile/1/edit">here</a>.
      </h4>
    </div>
  );
}
