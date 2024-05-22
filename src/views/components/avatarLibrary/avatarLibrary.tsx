import React, { useEffect, useState } from 'react';
import { S3AvatarSet } from '../../../clients/s3/S3Agent';
import Swal from 'sweetalert2';

export function AvatarLibrary() {
  const [usernameToSearchAvatar, setUsernameToSearchAvatar] = useState<
    string | null
  >(null);
  const [avatarLibrary, setAvatarLibrary] = useState<S3AvatarSet[] | null>(
    null,
  );

  const handleGetAvatars = async () => {
    if (!usernameToSearchAvatar) {
      Swal.fire({
        title: 'Please enter a username.',
        icon: 'warning',
      });
      return;
    }

    const response = await fetch(
      `/profile/mod/approvedavatars?username=${usernameToSearchAvatar}`,
    );

    if (response.status === 200) {
      const data: S3AvatarSet[] = await response.json();
      setAvatarLibrary(data);
      console.log(data);
    } else {
      Swal.fire({ title: await response.text(), icon: 'error' });
    }
  };

  return (
    <div>
      <h1>
        <u>Approved Avatars for a User:</u>
      </h1>
      <br />
      <div id="approvedAvatarsForUser" className="scrollableWindow alignCenter">
        <p>Here you can see all the approved avatars for a user.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', width: '333px' }}>
        <input
          type="text"
          name="username"
          className="form-control"
          id="getUserAvatarsInput"
          placeholder="Enter username"
          style={{ marginRight: '10px' }}
          onChange={(e) => setUsernameToSearchAvatar(e.target.value)}
        />
        <button
          className="btn btn-warning"
          id="getUserAvatarsButton"
          onClick={handleGetAvatars}
        >
          Get Avatars
        </button>
      </div>
    </div>
  );
}
