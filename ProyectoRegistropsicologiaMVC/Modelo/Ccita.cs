using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelo
{
    public class Ccita
    {
        public int idCita { get; set; }
        public DateTime fechaCita { get; set; }

        public string estadoCita { get; set; }

        public Cpsicologo cidPsicologo { get; set; }

        public Cpaciente cdniPaciente { get; set; }
    }
}
