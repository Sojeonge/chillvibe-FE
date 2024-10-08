import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseContainer from '../../../components/layout/BaseContainer';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material';
import { AddPhotoAlternate } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { signup } from '../../../api/auth/authApi';
import defaultImage from '../../../assets/default-profile.png';
import SnackbarAlert from '../../../components/common/Alert/SnackbarAlert';
import ServiceTermsModal from './fragments/ServiceTermsModal';
import PrivacyPolicyModal from './fragments/PrivacyPolicyModal';
import MarketingConsentModal from './fragments/MarketingConsentModal';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [introduction] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [allAccepted, setAllAccepted] = useState(false);
  const [serviceTermsModalOpen, setServiceTermsModalOpen] = useState(false);
  const [privacyPolicyModalOpen, setPrivacyPolicyModalOpen] = useState(false);
  const [marketingConsentModalOpen, setMarketingConsentModalOpen] =
    useState(false);
  const validatePassword = password =>
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,}$/.test(password);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  const defaultProfileImage = defaultImage;

  // 프로필 이미지 변경 핸들러
  const handleImageChange = event => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 전체 동의 체크박스 핸들러
  const handleAllAcceptedChange = event => {
    const isChecked = event.target.checked;
    setAllAccepted(isChecked);
    setTermsAccepted(isChecked);
    setMarketingAccepted(isChecked);
    setPrivacyPolicyAccepted(isChecked);
  };

  // 로그인화면으로 버튼 액션
  const handleNavigateLogin = () => {
    navigate('/login');
  };

  // 회원가입 버튼 액션
  const handleSubmit = async event => {
    event.preventDefault();

    setEmailError('');
    setPasswordError('');
    setPasswordMatchError('');
    setNicknameError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setPasswordMatchError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setPasswordMatchError('');

    // 비밀번호 검증
    if (!validatePassword(password)) {
      setPasswordError(
        '비밀번호는 최소 8자 이상이며, 문자, 숫자, 특수문자를 포함해야 합니다.',
      );
      return;
    }
    setPasswordMatchError('');

    // 닉네임 검증 (최대 12자)
    if (nickname.length > 12) {
      setNicknameError('닉네임은 최대 12자까지 입력할 수 있습니다.');
      return;
    }
    setNicknameError('');

    // 회원가입 정보를 서버로 전송하는 로직 추가
    const formData = new FormData();

    const joinDto = {
      email,
      password,
      nickname,
      introduction,
    };

    formData.append('joinDto', JSON.stringify(joinDto));

    if (profileImage) {
      formData.append('profileImg', profileImage);
    } else {
      const defaultImageBlob = await fetch(defaultProfileImage).then(res =>
        res.blob(),
      );
      formData.append(
        'profileImg',
        defaultImageBlob,
        'default-profile-image.png',
      );
    }

    try {
      // 회원가입 요청
      await signup(formData);
      // 성공 시, 로그인 화면으로 이동
      setSnackbar({
        open: true,
        message: '회원가입 되었습니다.',
        severity: 'success',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      // 에러 처리
      if (error.response) {
        // 서버에서 응답이 온 경우
        if (error.response.status === 409) {
          // 409 Conflict 에러 발생 시
          setEmailError('이미 가입된 이메일입니다.');
        } else {
          // 다른 상태 코드에 대한 일반적인 에러 처리
          setSnackbar({
            open: true,
            message: `회원가입 실패: ${error.response.status} ${error.response.statusText}`,
            severity: 'error',
          });
        }
      } else {
        // 서버 응답이 없는 경우 (네트워크 오류 등)
        setSnackbar({
          open: true,
          message: '회원가입 요청 처리 중 오류가 발생했습니다.',
          severity: 'error',
        });
      }
    }
  };

  // 입력 여부 확인 (버튼 활성화용)
  const isFormValid =
    email && password && nickname && termsAccepted && privacyPolicyAccepted;

  return (
    <BaseContainer>
      <Typography variant="title">Sign Up</Typography>
      <Box
        sx={{
          width: '70%',
          minWidth: '350px',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          m: '0 auto',
          p: 2,
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* 프로필 이미지 추가 영역 */}
          <Box
            sx={{
              position: 'relative',
              width: 150,
              height: 150,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 4,
              mx: 'auto',
            }}
          >
            <Avatar sx={{ width: 150, height: 150 }} src={imagePreview} />
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                borderRadius: '50%',
              }}
            >
              <AddPhotoAlternate />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </IconButton>
          </Box>
          {/* 회원정보 입력 필드 */}
          <TextField
            label="이메일"
            fullWidth
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            margin="normal"
            error={!!emailError}
            helperText={emailError}
            onFocus={() => setEmailError('')}
          />
          <TextField
            label="비밀번호"
            fullWidth
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            margin="normal"
            error={!!passwordError}
            helperText={passwordError}
          />
          <TextField
            label="비밀번호 확인"
            fullWidth
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            margin="normal"
            error={!!passwordMatchError}
            helperText={passwordMatchError}
          />
          <TextField
            label="닉네임"
            fullWidth
            required
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            margin="normal"
            inputProps={{ maxLength: 12 }}
            error={!!nicknameError}
            helperText={nicknameError || `최대 12자 입력 가능`}
          />
          {/* 약관 동의 */}
          <Box sx={{ width: '100%', my: 3 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allAccepted}
                    onChange={handleAllAcceptedChange}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 'bold' }}>전체 동의</Typography>
                }
              />
              <Divider sx={{ my: 1 }} />
              <Box>
                <FormControlLabel
                  required
                  control={
                    <Checkbox
                      size="small"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                    />
                  }
                  label="서비스 이용약관에 동의합니다."
                />
                <Button
                  size="small"
                  onClick={() => setServiceTermsModalOpen(true)}
                >
                  약관 보기
                </Button>
              </Box>
              <Box>
                <FormControlLabel
                  required
                  control={
                    <Checkbox
                      size="small"
                      checked={privacyPolicyAccepted}
                      onChange={e => setPrivacyPolicyAccepted(e.target.checked)}
                    />
                  }
                  label="개인정보 수집 및 이용에 동의합니다."
                />
                <Button
                  size="small"
                  onClick={() => setPrivacyPolicyModalOpen(true)}
                >
                  약관 보기
                </Button>
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={marketingAccepted}
                      onChange={e => setMarketingAccepted(e.target.checked)}
                    />
                  }
                  label="마케팅 정보 수신에 동의합니다."
                />
                <Button
                  size="small"
                  onClick={() => setMarketingConsentModalOpen(true)}
                >
                  약관 보기
                </Button>
              </Box>
            </FormGroup>
          </Box>
          {/* 버튼 */}
          <Box sx={{ width: '100%', display: 'flex', mt: 5, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleNavigateLogin}
              sx={{ flex: 1 }}
              size="large"
            >
              로그인 화면으로
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ flex: 1 }}
              disabled={!isFormValid}
              size="large"
            >
              회원가입
            </Button>
          </Box>
        </form>
      </Box>
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
      <ServiceTermsModal
        open={serviceTermsModalOpen}
        handleClose={() => setServiceTermsModalOpen(false)}
      />
      <PrivacyPolicyModal
        open={privacyPolicyModalOpen}
        handleClose={() => setPrivacyPolicyModalOpen(false)}
      />
      <MarketingConsentModal
        open={marketingConsentModalOpen}
        handleClose={() => setMarketingConsentModalOpen(false)}
      />
    </BaseContainer>
  );
};

export default Signup;
