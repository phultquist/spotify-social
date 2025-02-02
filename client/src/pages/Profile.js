import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkJWTAuth, getProfileData, getIsFollowing, followUser, unfollowUser, getPrivateMode } from '../lib/api.js';
import Button from '../components/button.js';
import Heading from '../components/heading.js';
import Kicker from '../components/kicker.js';
import styles from '../styles/profile.module.css';
import utilStyles from '../styles/utils.module.css';
import { Track, Artist, Text } from '../components';

const url = process.env.NODE_ENV === 'production' ? 'https://my-spotify-social.herokuapp.com' : 'http://localhost:5000';
const API_VERSION = 'v1'; // TEMPORARY FIX LATE

export default function Profile() {

	const [ privateMode, setPrivateMode ] = React.useState(true);
	const [ profileData, setProfileData ] = React.useState('');
	const [ auth, setAuth ] = React.useState(false);
	const [ me, setMe ] = React.useState(false);
	const [ myId, setMyId ] = React.useState('');
	const [ following, setFollowing ] = React.useState(false);
	const [ copied, setCopied ] = React.useState(false);

	const [ timeRange, setTimeRange ] = React.useState({
		tracks: 'short_term',
		artists: 'medium_term'
	});

	const { id } = useParams();

	const checkIsFollowing = async (id) => {
			
		try {
			const followingRes = await getIsFollowing(id);
			setFollowing(followingRes.data.isFollowing);
		} catch (err) {
			console.log(err);
		}
	}

	React.useEffect(() => {

		const checkPrivateMode = async (id) => {
			try {
				const privateRes = await getPrivateMode(id);
				if (privateRes.status === 200) {
					setPrivateMode(privateRes.data.private);
				}
			} catch (err) {
				console.log(err);
			}
		}

		checkPrivateMode(id);

		const callApi = async (id) => {
			
			try {
				const profileRes = await getProfileData(id);
				if (profileRes.status === 200) {
					setProfileData(profileRes.data);
				} else {
					setProfileData({});
				}
			} catch (err) {
				console.log(err);
				setProfileData({});
			}

		}

		callApi(id);

		const checkAuth = async () => {

			try {
				const authRes = await checkJWTAuth();
				setAuth(true);
				setMe(authRes.data.id === id);
				setMyId(authRes.data.id);
			} catch (err) {
				console.log(err);
			}
		}

		checkAuth();
		checkIsFollowing(id);

	}, []);

	const handleFollow = async () => {
		await followUser(id);
		await checkIsFollowing(id);
	}

	const handleUnfollow = async () => {
		await unfollowUser(id);
		await checkIsFollowing(id);
	}

	const copyLink = (str) => {
		const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
		setCopied(true);
	}

	const changeTimeRange = (section, newValue) => {
		const newTimeRange = {...timeRange};
		newTimeRange[section] = newValue;
		setTimeRange(newTimeRange);
	}


	return (
		<div className={styles.wrapper}>
			{
				(profileData !== ''
				&& Object.keys(profileData).length !== 0)
				?
				<div>
					<div className={styles.navButtonBox}>
						{
							auth
							&&
							<Link to={'/account/' + myId}><Button className={utilStyles.btnGreen}>← Account</Button></Link>
						}
					</div>
					<div className={styles.header}>
						<div className={styles.imgBox}>
							{profileData.user.images.length > 0 &&
							<img className={styles.profileImg} alt='Profile image' src={profileData.user.images[0].url}/>
							}
						</div>

						<div className={styles.headerBox}>
							<Kicker>Profile</Kicker>
							<Heading>{profileData.user.display_name}</Heading>
							<Text>{profileData.followerCount == 1 ? profileData.followerCount + " Follower" : profileData.followerCount + " Followers"}</Text>
							<div className={styles.followCopyButtonBox}>
									{
										auth
										?
										(
											following === false
											?
											<Button className={styles.leftButton + ' ' + utilStyles.btnGreen} onClick={handleFollow}>Follow</Button>
											:
											<Button className={styles.leftButton + ' ' + utilStyles.btnBlackOutlined} onClick={handleUnfollow}>Following</Button>
										)
										:
										<a href={url + '/' + API_VERSION + '/login'}><Button className={styles.leftButton + ' ' + utilStyles.btnGreen}>Login</Button></a>
									}
								<Button className={styles.copyButton + ' ' + (copied ? utilStyles.btnBlackStatic : utilStyles.btnGreen)} onClick={() => copyLink(window.location.href)}>{copied ? 'Copied!' : 'Copy Link'}</Button>
							</div>
						</div>

					</div>

					{
						(privateMode === false || me === true)
						?
						<div>
							<div className={styles.current}>
								{
									profileData.current !== ''
									?
									<Kicker>Currently Playing</Kicker>
									:
									<Kicker>Last Played</Kicker>
								}
								<div className={styles.currentContent}>
									{
										profileData.current !== ''
										?
										<Track item={profileData.current.item} />
										:
										<Track item={profileData.recent.items[0].track}/>
									}
								</div>
							</div>

							<div className={styles.top}>

								<div className={styles.topSection}>
									<Kicker>Top Tracks</Kicker>
									<div className={styles.timeFilter}>
										<Button
											className={utilStyles.btnBlack  + ' ' + (timeRange.tracks === 'short_term' ? styles.tabButtonTrue : styles.tabButtonFalse)}
											onClick={() => changeTimeRange('tracks', 'short_term')}
										>
											4 Weeks
										</Button>
										<Button
											className={utilStyles.btnBlack  + ' ' + (timeRange.tracks === 'medium_term' ? styles.tabButtonTrue : styles.tabButtonFalse)}
											onClick={() => changeTimeRange('tracks', 'medium_term')}
										>
											6 Months
										</Button>
										<Button
											className={utilStyles.btnBlack  + ' ' + (timeRange.tracks === 'long_term' ? styles.tabButtonTrue : styles.tabButtonFalse)}
											onClick={() => changeTimeRange('tracks', 'long_term')}
										>
											All Time
										</Button>
									</div>
									{profileData.tracks[timeRange.tracks].items.map(track => {
										return (
											<div className={styles.item}>
												<Track item={track}/>
											</div>
										);
									})}
								</div>

								<div className={styles.topSection}>
									<Kicker>Top Artists</Kicker>
									<div className={styles.timeFilter}>
										<Button
											className={utilStyles.btnBlack  + ' ' + (timeRange.artists === 'short_term' ? styles.tabButtonTrue : styles.tabButtonFalse)}
											onClick={() => changeTimeRange('artists', 'short_term')}
										>
											4 Weeks
										</Button>
										<Button
											className={utilStyles.btnBlack  + ' ' + (timeRange.artists === 'medium_term' ? styles.tabButtonTrue : styles.tabButtonFalse)}
											onClick={() => changeTimeRange('artists', 'medium_term')}
										>
											6 Months
										</Button>
										<Button
											className={utilStyles.btnBlack  + ' ' + (timeRange.artists === 'long_term' ? styles.tabButtonTrue : styles.tabButtonFalse)}
											onClick={() => changeTimeRange('artists', 'long_term')}
										>
											All Time
										</Button>
									</div>
									{profileData.artists[timeRange.artists].items.map(artist => {
										return (
											<div className={styles.item}>
											<Artist item={artist}/>
											</div>
											);
										})}
								</div>

							</div>
						</div>
						:
						<div>
							<br/>
							This account is private.
							<br/>
						</div>
					}
					
				</div>
				:
				(profileData !== '')
				?
				<div>
					<Heading className={styles.heading}>User Not Found.</Heading>
					<Text>The username "{id}" either does not exist in our database or is not a valid user on Spotify.</Text>
				</div>
				:
				<div>
					Loading...
				</div>
			}

		</div>
	)
}