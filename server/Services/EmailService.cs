using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace PortalEventos.Api.Services 
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        // Disparo do Link de Confirmação
        public async Task EnviarEmailAtivacaoAsync(string emailDestinatario, string nomeUsuario, string token)
        {
            var linkConfirmacao = $"http://localhost:5173/confirmar-email?token={token}";

            var mensagem = new MimeMessage();
            mensagem.From.Add(new MailboxAddress("Portal de Eventos", "noreply@portaleventos.com"));
            mensagem.To.Add(new MailboxAddress(nomeUsuario, emailDestinatario));
            mensagem.Subject = "Ative a sua conta no Portal de Eventos";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;'>
                        <h2 style='color: #2563eb;'>Bem-vindo, {nomeUsuario}!</h2>
                        <p>Obrigado por se registar. Para começar a garantir os seus ingressos, precisa de confirmar este endereço de e-mail.</p>
                        <div style='margin: 32px 0;'>
                            <a href='{linkConfirmacao}' 
                               style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;'>
                               Confirmar E-mail
                            </a>
                        </div>
                        <p style='font-size: 12px; color: #64748b;'>Se o botão não funcionar, copie e cole este link no navegador: <br/> {linkConfirmacao}</p>
                    </div>"
            };

            mensagem.Body = bodyBuilder.ToMessageBody();

            await ExecutarEnvioSmtpAsync(mensagem);
        }

        // Disparo do Ingresso 
        public async Task EnviarIngressoAsync(string emailDestinatario, string nomeUsuario, string nomeEvento)
        {
            var mensagem = new MimeMessage();
            mensagem.From.Add(new MailboxAddress("Portal de Eventos", "noreply@portaleventos.com"));
            mensagem.To.Add(new MailboxAddress(nomeUsuario, emailDestinatario));
            mensagem.Subject = $"Confirmação de Inscrição: {nomeEvento}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; border-radius: 8px;'>
                        <h2 style='color: #2563eb;'>Olá, {nomeUsuario}!</h2>
                        <p>A sua inscrição no evento <strong>{nomeEvento}</strong> foi confirmada com sucesso.</p>
                        <p>O seu QR Code e os detalhes do ingresso já estão disponíveis na sua área logada no portal.</p>
                        <br/>
                        <small style='color: #64748b;'>Este é um e-mail automático, por favor não responda.</small>
                    </div>"
            };

            mensagem.Body = bodyBuilder.ToMessageBody();

            await ExecutarEnvioSmtpAsync(mensagem);
        }

        // Método privado para não repetir a lógica de conexão em cada e-mail
        private async Task ExecutarEnvioSmtpAsync(MimeMessage mensagem)
        {
            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync("smtp.mailtrap.io", 587, false);
                // Substituir pelas credenciais do mailtrap
                await client.AuthenticateAsync("0d472385cf08ae", "4db8023cebd64a");
                
                await client.SendAsync(mensagem);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // Num ambiente de produção, isto seria gravado no Serilog/ILogger
                Console.WriteLine($"Falha no envio de e-mail SMTP: {ex.Message}");
            }
        }
    }
}