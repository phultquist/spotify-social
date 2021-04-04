import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAccountData, changePrivateMode, getPrivateMode } from '../lib/api.js';
import styles from '../styles/account.module.css';
import utilStyles from '../styles/utils.module.css';
import { Text, Button, Heading, Kicker, Feed, Settings } from '../components';

const url = process.env.NODE_ENV === 'production' ? 'https://my-spotify-social.herokuapp.com' : 'http://localhost:5000';
const API_VERSION = 'v1'; // TEMPORARY FIX LATE

export default function Account() {

	const [ accountData, setAccountData ] = React.useState({});

	const [ feedData, setFeedData ] = React.useState({});
	const [ tab, setTab ] = React.useState('feed'); // feed, preferences
	const [ privateMode, setPrivateMode ] = React.useState(false);

	const { id } = useParams();

	React.useEffect(() => {

		const callApi = async (id) => {

			try {
				const accountRes = await getAccountData(id);
				setAccountData({
					status: 200,
					...accountRes.data
				});

				const privateRes = await getPrivateMode(id);
				setPrivateMode(privateRes.data.private);

			} catch (err) {
				console.log(err);
				setAccountData({
					status: 400
				});
			}

		};

		callApi(id);


	}, []);

	const switchTab = (newTab) => {
		setTab(newTab);
	};

	const updatePrivate = async (id) => {
		await changePrivateMode(id);
		const privateRes = await getPrivateMode(id);
		setPrivateMode(privateRes.data.private);
	}

	return (
		<div>
			{
				!(accountData &&
				Object.keys(accountData).length !== 0)
				?
				<Text>Loading...</Text>
				:
				<>
				<Kicker>Account</Kicker>
				{
					accountData.status === 200
					?
					<>
						<div className={styles.headingBox}>
							<Heading className={styles.heading}>{tab}</Heading>
							<div className={styles.vertAlign}>
								<Link to={'/' + id}><Button className={utilStyles.btnGreen}>View Profile</Button></Link>
							</div>
						</div>
						<div className={styles.tabBox}>
							<Button className={styles.tabButton + ' ' + (tab === 'feed' ? styles.tabButtonTrue : styles.tabButtonFalse)} onClick={() => switchTab('feed')}>Feed</Button>
							<Button className={styles.tabButton + ' ' + (tab === 'settings' ? styles.tabButtonTrue : styles.tabButtonFalse)} onClick={() => switchTab('settings')}>Settings</Button>
						</div>
						<div className={styles.sectionBox}>
						{
							(tab === 'feed' && tab !== 'settings')
							?
							<Feed feed={accountData.feed} />
							:
							<Settings handleChange={() => updatePrivate(id)} privateMode={privateMode} url={url + '/' + API_VERSION + '/account/delete/' + id}/>
						}
						</div>
					</>
					:
					<>
						<div className={styles.headingBox}>
							<Heading className={styles.heading}>User Not Found.</Heading>
							<div className={styles.vertAlign}>
								<a href={url + '/' + API_VERSION + '/login'}><Button className={utilStyles.btnGreen}>Login</Button></a>
							</div>
						</div>	
					</>
				}
				</>
			}
			

		</div>
	)
}