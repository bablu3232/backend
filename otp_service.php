<?php
// Shared OTP sending logic for DrugSearch

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once 'PHPMailer/src/Exception.php';
require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/SMTP.php';

/**
 * Send an OTP to the given email if the user exists.
 *
 * @param mysqli $conn
 * @param string $email
 * @return array ['success' => bool, 'message' => string, 'code' => string|null]
 */
function sendOtpForEmail(mysqli $conn, string $email): array
{
    $email = trim($email);

    // Check user exists
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows === 0) {
        return [
            'success' => false,
            'code' => 'not_registered',
            'message' => 'Email not registered'
        ];
    }

    // Generate OTP
    $otp = random_int(100000, 999999);
    $expiry = date("Y-m-d H:i:s", strtotime("+5 minutes"));

    // Save OTP
    $save = $conn->prepare(
        "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?"
    );
    $save->bind_param("sss", $otp, $expiry, $email);
    $save->execute();

    // Send mail
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'fulllswingg@gmail.com';
        $mail->Password = 'rfopnvzrpgxltxxj';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('YOUR_GMAIL@gmail.com', 'DrugSearch');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Your DrugSearch OTP';
        $mail->Body = "
            <h3>OTP Verification</h3>
            <p>Your OTP is <b>$otp</b></p>
            <p>Valid for 5 minutes</p>
        ";

        $mail->send();

        return [
            'success' => true,
            'code' => null,
            'message' => 'OTP sent to email'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'code' => 'mail_error',
            'message' => 'Failed to send OTP'
        ];
    }
}

