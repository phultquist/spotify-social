import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProfileData } from '../lib/api.js';
import Button from '../components/button.js';
import Heading from '../components/heading.js';
import Kicker from '../components/kicker.js';
import Text from '../components/text.js';
import styles from '../styles/profile.module.css';

export default function Profile() {

	const [ profileData, setProfileData ] = React.useState({});

	const { id } = useParams();

	React.useEffect(() => {

		const callApi = async (id) => {
			
			try {
				const profileRes = await getProfileData(id);
				setProfileData(profileRes.data);
			} catch (err) {
				console.log(err);
			}

		}

		callApi(id);

	}, []);


	return (
		<div>
			{
				(profileData
				&& Object.keys(profileData).length !== 0)
				?
				<div className={styles.header}>
					<div className={styles.imgBox}>
						{profileData.user.images.length > 0 &&
						<img className={styles.profileImg} alt='Profile image' src={profileData.user.images[0].url}/>
						}
					</div>

					<div className={styles.headerBox}>
						<Kicker>Profile</Kicker>
						<Heading>{profileData.user.display_name}</Heading>
						<Text>{profileData.user.followers.total} Followers</Text>
					</div>
				</div>
				:
				<div>
					Loading...
				</div>
			}
			<br/>
			<Link to='/'><Button>Home</Button></Link>
		</div>
	)
}