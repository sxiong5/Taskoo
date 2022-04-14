import React from 'react';
import useAccountInfo from '@/hooks/useAccountInfo';
import { Avatar, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { stringAvatar } from '@/utils';

const size = 80;

const Info: React.FC = () => {
	const { t } = useTranslation();
	const { avatar, fullName, department, position } = useAccountInfo();

	return (
		<Stack alignItems='center' spacing={1}>
			<Tooltip title={t('tooltip.avatar') as string} placement='top'>
				<label htmlFor='upload-avatar' style={{ cursor: 'pointer' }}>
					<input style={{ display: 'none' }} accept='image/*' id='upload-avatar' type='file' />
					{avatar ? (
						<Avatar sx={{ width: size, height: size }} alt={fullName} src={avatar} />
					) : (
						<Avatar alt={fullName} {...stringAvatar(fullName, size, size)} />
					)}
				</label>
			</Tooltip>
			<Typography variant='h6' component='span'>
				{fullName}
			</Typography>
			<Stack direction='row' spacing={1}>
				<Typography>{department}</Typography>
				<Divider orientation='vertical' flexItem />
				<Typography>{position}</Typography>
			</Stack>
		</Stack>
	);
};

export default Info;
