import React from 'react';
import useAccountInfo from '@/hooks/useAccountInfo';
import { Avatar, CardContent, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { stringAvatar } from '@/utils';
import Styled from '@/components/widgets/Styled';

const size = 80;

const Profile: React.FC = () => {
	const { t } = useTranslation();
	const { avatar, fullName, department, position } = useAccountInfo();

	return (
		<Styled.Card>
			<CardContent>
				<Styled.Title>{t('Profile')}</Styled.Title>
				<Stack alignItems='center' spacing={1}>
					<label htmlFor='upload-avatar' style={{ cursor: 'pointer' }}>
						<input style={{ display: 'none' }} accept='image/*' id='upload-avatar' type='file' />
						{avatar ? (
							<Avatar sx={{ width: size, height: size }} alt={fullName} src={avatar} />
						) : (
							<Avatar alt={fullName} {...stringAvatar(fullName, size, size)} />
						)}
					</label>
					<Typography variant='h6' component='span'>
						{fullName}
					</Typography>
					<Stack direction='row' spacing={1}>
						<Typography>{department}</Typography>
						<Divider orientation='vertical' flexItem />
						<Typography>{position}</Typography>
					</Stack>
				</Stack>
			</CardContent>
		</Styled.Card>
	);
};

export default Profile;